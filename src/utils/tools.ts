export function isMobile(): boolean {
    return typeof window.orientation !== "undefined" || /IEMobile|iPhone|iPad|Android.*Mobile/i.test(navigator.userAgent);
}
