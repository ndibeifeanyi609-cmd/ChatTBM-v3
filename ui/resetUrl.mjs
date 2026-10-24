export function captureAndClearResetToken(href, replaceState) {
    const resetUrl = new URL(href);
    const token = resetUrl.searchParams.get('token') || '';
    if (token) {
        resetUrl.searchParams.delete('token');
        replaceState({}, '', resetUrl.pathname + resetUrl.search + resetUrl.hash);
    }
    return token;
}

export function shouldRestoreSignedInSession(user, resetToken) {
    return Boolean(user && !resetToken);
}
