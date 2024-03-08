function HTMLMaker(OTP: string): string {
    const text = `<html>
    <h3>Your verification code is</h3>
    <h4>${OTP}\n</h4>
    <p>Ignore this message if you didn't make an action that requires a verification</p>`
    return text
}

export { HTMLMaker };