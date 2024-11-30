function modToName(mod, platform) {
    const platformVersion = platform.length > 0 ? mod.gd[platform] : "";
    return `<a href="https://geode-sdk.org/mods/${mod.id}">${mod.name} by ${mod.developers.find(x => x.is_owner).display_name}`
    + (platformVersion.length > 0 ? ` (GD ${platformVersion}, Geode ${mod.geode})</a>` : ` (Geode ${mod.geode})</a>`);
}

function convertGD(gd, version) {
    return {
        win: gd.win == version || gd.win == "*" || version.length <= 0 ? gd.win : "",
        android32: gd.android32 == version || gd.android32 == "*" || version.length <= 0 ? gd.android32 : "",
        android64: gd.android64 == version || gd.android64 == "*" || version.length <= 0 ? gd.android64 : "",
        "mac-intel": gd["mac-intel"] == version || gd["mac-intel"] == "*" || version.length <= 0 ? gd["mac-intel"] : "",
        "mac-arm": gd["mac-arm"] == version || gd["mac-arm"] == "*" || version.length <= 0 ? gd["mac-arm"] : "",
    }
}

function responseToMod(response, gd) {
    return {
        id: response.id,
        name: response.versions[0].name,
        description: response.versions[0].description,
        developers: response.developers,
        gd: convertGD(response.versions[0].gd, gd),
        geode: response.versions[0].geode,
        downloads: response.download_count,
        latestDownloads: response.versions[0].download_count,
        version: response.versions[0].version,
        featured: response.featured
    }
}

async function getMods(gd, geode) {
    const mods = [];

    if (sessionStorage && sessionStorage.getItem("mods")) return JSON.parse(sessionStorage.getItem("mods"));

    let gdVersion = gd != null ? gd : "";
    let geodeVersion = geode != null ? geode : "";
    const baseURL = `https://api.geode-sdk.org/v1/mods?per_page=100${gdVersion ? `&gd=${gdVersion}` : ""}${geodeVersion ? `&geode=${geodeVersion}` : ""}`;
    const page1 = await fetch(baseURL).then(r => r.json());
    mods.push(...page1.payload.data.map(res => responseToMod(res, gdVersion)));
    const maxPage = Math.ceil(page1.payload.count / 100);
    for (let i = 2; i <= maxPage; i++) {
        const page = await fetch(`${baseURL}&page=${i}`).then(r => r.json());
        mods.push(...page.payload.data.map(res => responseToMod(res, gdVersion)));
    }

    if (sessionStorage) sessionStorage.setItem("mods", JSON.stringify(mods));

    return mods;
}

async function getDevelopers() {
    const developers = [];

    if (sessionStorage && sessionStorage.getItem("developers")) return JSON.parse(sessionStorage.getItem("developers"));

    const baseURL = "https://api.geode-sdk.org/v1/developers?per_page=100";
    const page1 = await fetch(baseURL).then(r => r.json());
    developers.push(...page1.payload.data);
    const maxPage = Math.ceil(page1.payload.count / 100);
    for (let i = 2; i <= maxPage; i++) {
        const page = await fetch(`${baseURL}&page=${i}`).then(r => r.json());
        developers.push(...page.payload.data);
    }

    if (sessionStorage) sessionStorage.setItem("developers", JSON.stringify(developers));

    return developers;
}
