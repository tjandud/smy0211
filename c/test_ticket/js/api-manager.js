// =============================================
// API Key Manager - API 키 관리 모듈
// 의존성: supabase-config.js (supabase 객체)
// =============================================

// 관리자 비밀번호 해시 (SHA-256)
// 비밀번호: '123456789'
const ADMIN_PASSWORD_HASH = '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225';

// 암호화 키 (관리자 비밀번호 기반)
const ENCRYPTION_SALT = 'TicketPro_API_Key_Salt_2024';

// =============================================
// 비밀번호 검증
// =============================================
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyAdminPassword(password) {
    const hash = await hashPassword(password);
    return hash === ADMIN_PASSWORD_HASH;
}

// =============================================
// AES-GCM 암호화/복호화
// =============================================
async function deriveEncryptionKey(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password + ENCRYPTION_SALT),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(ENCRYPTION_SALT),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptApiKey(plainText, password) {
    try {
        const key = await deriveEncryptionKey(password);
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoder.encode(plainText)
        );

        // IV + 암호문을 Base64로 인코딩
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        return btoa(String.fromCharCode(...combined));
    } catch (err) {
        console.error('암호화 실패:', err);
        return null;
    }
}

async function decryptApiKey(encryptedText, password) {
    try {
        const key = await deriveEncryptionKey(password);

        // Base64 디코딩
        const combined = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)));
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (err) {
        console.error('복호화 실패:', err);
        return null;
    }
}

// =============================================
// API 키 조회 (일반 사용)
// =============================================
/**
 * DB에서 특정 API 키 조회 (암호화된 키는 복호화 필요)
 * @param {string} keyName - 키 이름 ('gemini', 'openai' 등)
 * @param {string} adminPassword - 복호화를 위한 관리자 비밀번호 (선택)
 * @returns {string|null} - API 키 값 또는 null
 */
async function getApiKey(keyName, adminPassword = null) {
    try {
        const { data, error } = await supabase
            .from('api_keys')
            .select('key_value, is_encrypted')
            .eq('key_name', keyName)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('API 키 조회 오류:', error);
            return null;
        }

        if (!data?.key_value) return null;

        // 암호화된 키인 경우 복호화
        if (data.is_encrypted && adminPassword) {
            return await decryptApiKey(data.key_value, adminPassword);
        }

        // 암호화되지 않은 키 (레거시 호환)
        return data.key_value;
    } catch (err) {
        console.error('API 키 조회 실패:', err);
        return null;
    }
}

/**
 * 시스템 내부에서 사용하는 API 키 조회 (기본 비밀번호 사용)
 * @param {string} keyName - 키 이름
 * @returns {string|null} - API 키 값 또는 null
 */
async function getApiKeyInternal(keyName) {
    try {
        const { data, error } = await supabase
            .from('api_keys')
            .select('key_value, is_encrypted')
            .eq('key_name', keyName)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('API 키 조회 오류:', error);
            return null;
        }

        if (!data?.key_value) return null;

        // 암호화된 키인 경우 기본 비밀번호로 복호화
        if (data.is_encrypted) {
            // '123456789'는 데모용 기본 비밀번호입니다.
            // 실제 프로덕션 환경에서는 안전하게 관리해야 합니다.
            return await decryptApiKey(data.key_value, '123456789');
        }

        // 암호화되지 않은 키 (평문) 바로 반환
        return data.key_value;
    } catch (err) {
        console.error('API 키 조회 실패:', err);
        return null;
    }
}

// =============================================
// API 키 저장/수정 (관리자용)
// =============================================
/**
 * API 키 저장 (암호화하여 저장)
 * @param {string} keyName - 키 이름
 * @param {string} keyValue - 키 값 (평문)
 * @param {string} adminPassword - 관리자 비밀번호
 * @param {string} description - 키 설명 (선택)
 * @returns {object} - { success: boolean, message: string }
 */
async function setApiKey(keyName, keyValue, adminPassword, description = '') {
    // 비밀번호 검증
    const isValid = await verifyAdminPassword(adminPassword);
    if (!isValid) {
        return { success: false, message: '관리자 비밀번호가 올바르지 않습니다.' };
    }

    // 입력값 검증
    if (!keyName || !keyValue) {
        return { success: false, message: '키 이름과 값은 필수입니다.' };
    }

    try {
        // 평문으로 저장 (암호화 없음)
        const { error } = await supabase
            .from('api_keys')
            .upsert({
                key_name: keyName.toLowerCase().trim(),
                key_value: keyValue.trim(),
                is_encrypted: false,
                description: description,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'key_name'
            });

        if (error) {
            console.error('API 키 저장 오류:', error);
            return { success: false, message: '저장 중 오류가 발생했습니다.' };
        }

        return { success: true, message: 'API 키가 저장되었습니다.' };
    } catch (err) {
        console.error('API 키 저장 실패:', err);
        return { success: false, message: '저장 중 오류가 발생했습니다.' };
    }
}

// =============================================
// API 키 목록 조회 (관리자용)
// =============================================
/**
 * 등록된 모든 API 키 목록 조회 (암호화된 키는 복호화하여 표시)
 * @param {string} adminPassword - 관리자 비밀번호
 * @returns {object} - { success: boolean, data: Array, message: string }
 */
async function listApiKeys(adminPassword) {
    // 비밀번호 검증
    const isValid = await verifyAdminPassword(adminPassword);
    if (!isValid) {
        return { success: false, data: [], message: '관리자 비밀번호가 올바르지 않습니다.' };
    }

    try {
        const { data, error } = await supabase
            .from('api_keys')
            .select('id, key_name, key_value, description, is_active, created_at, updated_at')
            .order('key_name');

        if (error) {
            console.error('API 키 목록 조회 오류:', error);
            return { success: false, data: [], message: '조회 중 오류가 발생했습니다.' };
        }

        // 마스킹 처리 (관리자 페이지에서 토글로 확인 가능)
        const maskedData = data.map((item) => {
            return {
                ...item,
                key_value_masked: maskApiKey(item.key_value),
                key_value_full: item.key_value  // 관리자에게는 전체 키 제공
            };
        });

        return { success: true, data: maskedData, message: '조회 성공' };
    } catch (err) {
        console.error('API 키 목록 조회 실패:', err);
        return { success: false, data: [], message: '조회 중 오류가 발생했습니다.' };
    }
}

// =============================================
// API 키 삭제 (비활성화)
// =============================================
/**
 * API 키 삭제 (is_active = false로 변경)
 * @param {string} keyName - 삭제할 키 이름
 * @param {string} adminPassword - 관리자 비밀번호
 * @returns {object} - { success: boolean, message: string }
 */
async function deleteApiKey(keyName, adminPassword) {
    // 비밀번호 검증
    const isValid = await verifyAdminPassword(adminPassword);
    if (!isValid) {
        return { success: false, message: '관리자 비밀번호가 올바르지 않습니다.' };
    }

    try {
        const { error } = await supabase
            .from('api_keys')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('key_name', keyName);

        if (error) {
            console.error('API 키 삭제 오류:', error);
            return { success: false, message: '삭제 중 오류가 발생했습니다.' };
        }

        return { success: true, message: 'API 키가 삭제되었습니다.' };
    } catch (err) {
        console.error('API 키 삭제 실패:', err);
        return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
}

// =============================================
// API 키 완전 삭제 (DB에서 제거)
// =============================================
/**
 * API 키 완전 삭제
 * @param {string} keyName - 삭제할 키 이름
 * @param {string} adminPassword - 관리자 비밀번호
 * @returns {object} - { success: boolean, message: string }
 */
async function permanentDeleteApiKey(keyName, adminPassword) {
    // 비밀번호 검증
    const isValid = await verifyAdminPassword(adminPassword);
    if (!isValid) {
        return { success: false, message: '관리자 비밀번호가 올바르지 않습니다.' };
    }

    try {
        const { error } = await supabase
            .from('api_keys')
            .delete()
            .eq('key_name', keyName);

        if (error) {
            console.error('API 키 완전 삭제 오류:', error);
            return { success: false, message: '삭제 중 오류가 발생했습니다.' };
        }

        return { success: true, message: 'API 키가 완전히 삭제되었습니다.' };
    } catch (err) {
        console.error('API 키 완전 삭제 실패:', err);
        return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
}

// =============================================
// 유틸리티 함수
// =============================================

/**
 * API 키 마스킹 (중간 부분 숨김)
 * @param {string} key - 원본 키
 * @returns {string} - 마스킹된 키
 */
function maskApiKey(key) {
    if (!key || key.length < 10) return '●●●●●●●●';
    const start = key.substring(0, 6);
    const end = key.substring(key.length - 4);
    return `${start}${'●'.repeat(key.length - 10)}${end}`;
}

/**
 * API 키 유효성 검사 (간단한 형식 체크)
 * @param {string} keyName - 키 이름
 * @param {string} keyValue - 키 값
 * @returns {object} - { valid: boolean, message: string }
 */
function validateApiKey(keyName, keyValue) {
    if (keyName === 'gemini' && !keyValue.startsWith('AIza')) {
        return { valid: false, message: 'Gemini API 키는 AIza로 시작해야 합니다.' };
    }
    if (keyName === 'openai' && !keyValue.startsWith('sk-')) {
        return { valid: false, message: 'OpenAI API 키는 sk-로 시작해야 합니다.' };
    }
    if (keyValue.length < 20) {
        return { valid: false, message: 'API 키가 너무 짧습니다.' };
    }
    return { valid: true, message: '유효한 키 형식입니다.' };
}

// =============================================
// 기존 평문 API 키 암호화 마이그레이션
// =============================================
/**
 * 암호화되지 않은 기존 API 키들을 암호화
 * @param {string} adminPassword - 관리자 비밀번호
 * @returns {object} - { success: boolean, message: string, migrated: number }
 */
async function migrateUnencryptedKeys(adminPassword) {
    // 비밀번호 검증
    const isValid = await verifyAdminPassword(adminPassword);
    if (!isValid) {
        return { success: false, message: '관리자 비밀번호가 올바르지 않습니다.', migrated: 0 };
    }

    try {
        // 암호화되지 않은 키 조회
        const { data, error } = await supabase
            .from('api_keys')
            .select('id, key_name, key_value')
            .or('is_encrypted.is.null,is_encrypted.eq.false');

        if (error) {
            console.error('마이그레이션 조회 오류:', error);
            return { success: false, message: '조회 중 오류가 발생했습니다.', migrated: 0 };
        }

        if (!data || data.length === 0) {
            return { success: true, message: '마이그레이션할 키가 없습니다.', migrated: 0 };
        }

        let migratedCount = 0;

        for (const item of data) {
            const encryptedKey = await encryptApiKey(item.key_value, adminPassword);
            if (encryptedKey) {
                const { error: updateError } = await supabase
                    .from('api_keys')
                    .update({
                        key_value: encryptedKey,
                        is_encrypted: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.id);

                if (!updateError) {
                    migratedCount++;
                }
            }
        }

        return {
            success: true,
            message: `${migratedCount}개의 API 키가 암호화되었습니다.`,
            migrated: migratedCount
        };
    } catch (err) {
        console.error('마이그레이션 실패:', err);
        return { success: false, message: '마이그레이션 중 오류가 발생했습니다.', migrated: 0 };
    }
}
