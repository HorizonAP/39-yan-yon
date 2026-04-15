let electron = require("electron");
let path = require("path");
//#region node_modules/@electron-toolkit/utils/dist/index.mjs
var is = { dev: !electron.app.isPackaged };
var platform = {
	isWindows: process.platform === "win32",
	isMacOS: process.platform === "darwin",
	isLinux: process.platform === "linux"
};
var electronApp = {
	setAppUserModelId(id) {
		if (platform.isWindows) electron.app.setAppUserModelId(is.dev ? process.execPath : id);
	},
	setAutoLaunch(auto) {
		if (platform.isLinux) return false;
		const isOpenAtLogin = () => {
			return electron.app.getLoginItemSettings().openAtLogin;
		};
		if (isOpenAtLogin() !== auto) {
			electron.app.setLoginItemSettings({ openAtLogin: auto });
			return isOpenAtLogin() === auto;
		} else return true;
	},
	skipProxy() {
		return electron.session.defaultSession.setProxy({ mode: "direct" });
	}
};
var optimizer = {
	watchWindowShortcuts(window, shortcutOptions) {
		if (!window) return;
		const { webContents } = window;
		const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
		webContents.on("before-input-event", (event, input) => {
			if (input.type === "keyDown") {
				if (!is.dev) {
					if (input.code === "KeyR" && (input.control || input.meta)) event.preventDefault();
					if (input.code === "KeyI" && (input.alt && input.meta || input.control && input.shift)) event.preventDefault();
				} else if (input.code === "F12") if (webContents.isDevToolsOpened()) webContents.closeDevTools();
				else {
					webContents.openDevTools({ mode: "undocked" });
					console.log("Open dev tool...");
				}
				if (escToCloseWindow) {
					if (input.code === "Escape" && input.key !== "Process") {
						window.close();
						event.preventDefault();
					}
				}
				if (!zoom) {
					if (input.code === "Minus" && (input.control || input.meta)) event.preventDefault();
					if (input.code === "Equal" && input.shift && (input.control || input.meta)) event.preventDefault();
				}
			}
		});
	},
	registerFramelessWindowIpc() {
		electron.ipcMain.on("win:invoke", (event, action) => {
			const win = electron.BrowserWindow.fromWebContents(event.sender);
			if (win) {
				if (action === "show") win.show();
				else if (action === "showInactive") win.showInactive();
				else if (action === "min") win.minimize();
				else if (action === "max") if (win.isMaximized()) win.unmaximize();
				else win.maximize();
				else if (action === "close") win.close();
			}
		});
	}
};
//#endregion
//#region src/main/index.ts
function createWindow() {
	const icon = (0, path.join)(__dirname, "../../resources/icon.png");
	const mainWindow = new electron.BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		...process.platform === "linux" ? { icon } : {},
		webPreferences: {
			preload: (0, path.join)(__dirname, "preload.js"),
			sandbox: false
		}
	});
	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});
	mainWindow.webContents.setWindowOpenHandler((details) => {
		electron.shell.openExternal(details.url);
		return { action: "deny" };
	});
	if (is.dev && process.env["VITE_DEV_SERVER_URL"]) mainWindow.loadURL(process.env["VITE_DEV_SERVER_URL"]);
	else mainWindow.loadFile((0, path.join)(__dirname, "../dist/index.html"));
}
electron.app.whenReady().then(() => {
	electronApp.setAppUserModelId("com.electron");
	electron.app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});
	electron.ipcMain.on("ping", () => console.log("pong"));
	createWindow();
	electron.app.on("activate", function() {
		if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") electron.app.quit();
});
//#endregion
