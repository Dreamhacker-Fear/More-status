import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

const CustomStatusStore = findByProps("updateAsync", "getCustomStatus");

let intervalId = null;
let currentIndex = 0;

const defaultSettings = {
    enabled: false,
    intervalMinutes: 15,
    randomOrder: false,
    statuses: [
        { text: "gaming" },
        { text: "coffee time" },
        { text: "coding" },
        { text: "afk-ish" },
    ],
    quietHours: { enabled: false, start: 23, end: 8 },
};

function loadSettings() {
    storage.settings = Object.assign({}, defaultSettings, storage.settings ?? {});
    return storage.settings;
}

function inQuietHours(settings) {
    if (!settings.quietHours.enabled) return false;
    const hour = new Date().getHours();
    const { start, end } = settings.quietHours;
    return start > end
        ? hour >= start || hour < end
        : hour >= start && hour < end;
}

function pickNextStatus(settings) {
    const list = settings.statuses;
    if (!list.length) return null;

    if (settings.randomOrder) {
        return list[Math.floor(Math.random() * list.length)];
    }

    const status = list[currentIndex % list.length];
    currentIndex++;
    return status;
}

function applyStatus(status) {
    if (!status || !CustomStatusStore) return;
    try {
        CustomStatusStore.updateAsync({
            text: status.text,
            expiresAtMs: null,
        });
    } catch (e) {
        console.error("[StatusRotator] failed to update status:", e);
    }
}

function tick() {
    const settings = loadSettings();
    if (!settings.enabled) return;
    if (inQuietHours(settings)) return;

    const next = pickNextStatus(settings);
    applyStatus(next);
}

function startRotation() {
    stopRotation();
    const settings = loadSettings();
    const ms = Math.max(1, settings.intervalMinutes) * 60 * 1000;
    intervalId = setInterval(tick, ms);
    tick();
}

function stopRotation() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

export function onLoad() {
    const settings = loadSettings();
    if (settings.enabled) startRotation();
}

export function onUnload() {
    stopRotation();
}

export const StatusRotatorAPI = {
    getSettings: loadSettings,
    save(newSettings) {
        storage.settings = Object.assign({}, loadSettings(), newSettings);
        if (storage.settings.enabled) startRotation();
        else stopRotation();
    },
    toggle() {
        const settings = loadSettings();
        settings.enabled = !settings.enabled;
        storage.settings = settings;
        if (settings.enabled) startRotation();
        else stopRotation();
        return settings.enabled;
    },
};

export { Settings as settings };
