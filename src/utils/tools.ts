/**
 * 检查是否为移动端设备
 * window.orientation 属性用于检测设备是否处于横屏或竖屏状态
 * navigator.userAgent 属性用于获取用户代理字符串，用于检测移动设备
 * @return {boolean}
 */
export function isMobile(): boolean {
    // 检查 navigator.userAgent 中是否包含特定的移动端关键字
    return (
        typeof window.orientation !== "undefined" ||
        navigator.userAgent.indexOf("IEMobile") !== -1 ||
        navigator.userAgent.indexOf("iPhone") !== -1 ||
        navigator.userAgent.indexOf("iPad") !== -1 ||
        (navigator.userAgent.indexOf("Android") !== -1 && navigator.userAgent.indexOf("Mobile") !== -1)
    );
}