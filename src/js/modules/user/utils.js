export const mathAgo = (datePast) => {
    const dateNow = new Date()
    if (dateNow - datePast > 0) {
        let delta = (dateNow - datePast) / 1000;
        const dDisplay = Math.floor(delta / 86400);
        delta -= dDisplay * 86400;

        const hDisplay = Math.floor(delta / 3600) % 24;
        delta -= hDisplay * 3600;

        const mDisplay = Math.floor(delta / 60) % 60;
        delta -= mDisplay * 60;

        const sDisplay = Math.floor(delta % 60)
        return `${Math.abs(dDisplay)} days, ${Math.abs(hDisplay)} hrs, ${Math.abs(mDisplay)} mins, ${Math.abs(sDisplay)} secs`;
    }
    else {
        return `0 days, 0 hrs, 0 mins, 0 secs`;
    }
}