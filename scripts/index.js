const GD_VERSION = "2.206";
const GEODE_VERSION = "3.8.1";

function modToName(mod) {
    return `<a href="https://geode-sdk.org/mods/${mod.id}">${mod.name} by ${mod.developers.find(x => x.is_owner).display_name}</a>`;
}

function convertGD(gd) {
    return {
        win: gd.win == "2.206" || gd.win == "*",
        android32: gd.android32 == "2.206" || gd.android32 == "*",
        android64: gd.android64 == "2.206" || gd.android64 == "*",
        "mac-intel": gd["mac-intel"] == "2.206" || gd["mac-intel"] == "*",
        "mac-arm": gd["mac-arm"] == "2.206" || gd["mac-arm"] == "*"
    }
}

function responseToMod(response) {
    return {
        id: response.id,
        name: response.versions[0].name,
        description: response.versions[0].description,
        developers: response.developers,
        gd: convertGD(response.versions[0].gd),
        downloads: response.download_count,
        latestDownloads: response.versions[0].download_count,
        version: response.versions[0].version,
        featured: response.featured
    }
}

async function getMods() {
    const mods = [];

    const page1 = await fetch(`https://api.geode-sdk.org/v1/mods?gd=${GD_VERSION}&geode=${GEODE_VERSION}&per_page=100`).then(r => r.json());
    mods.push(...page1.payload.data.map(responseToMod));
    const maxPage = Math.ceil(page1.payload.count / 100);
    for (let i = 2; i <= maxPage; i++) {
        const page = await fetch(`https://api.geode-sdk.org/v1/mods?gd=${GD_VERSION}&geode=${GEODE_VERSION}&per_page=100&page=${i}`).then(r => r.json());
        mods.push(...page.payload.data.map(responseToMod));
    }

    return mods;
}
