# Changelog

## 2025년 12월 10일

### Added "Real Mode" Selection Page

-   Created `b/real_choice.html` as a copy of `c/test_ticket/main-pages/choice.html`.
-   Modified the title of `b/real_choice.html` to "TicketPro - 실전 티케팅 선택".
-   Updated the main title within `b/real_choice.html` to "원하는 실전 티케팅을 선택해주세요".
-   Adjusted all relative links within `b/real_choice.html` to ensure correct navigation from the `b` directory.

### Updated Main Landing Page Link

-   Modified `a/index.html` to point the "실전 모드" button's `href` to `b/real_choice.html`.

### Modified "Real Mode" Selection Content (`b/real_choice.html`)

-   **Melon (멜론) Section:**
    -   Changed card title and text to reflect "Melon" (멜론) site practice.
    -   Added `b/멜론.png` image to the card.
    -   Updated `onclick` event and button `href` to `outdex.html`.
-   **Interpark (인터파크) Section:**
    -   Changed card title and text to reflect "Interpark" (인터파크) site practice.
    -   Added `b/인터파크.png` image to the card.
    -   Updated `onclick` event and button `href` to `../d/ticket.html`.
-   **Gocheok Dome (고척돔) Section:**
    -   Changed card title and text to reflect "Gocheok Dome" (고척돔) practice.
    -   Updated `onclick` event and button `href` to call `openModal()` function (for "Under Development" notification).

### Updated Payment Page Redirection (`b/payment.html`)

-   Modified the "다음" (Next) button's `<a>` tag in `b/payment.html` to include `href="../c/test_ticket/main-pages/ai-feedback.html"`, redirecting to the AI feedback page upon completion.
