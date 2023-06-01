import core from '@actions/core';

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

import got from 'got';
import unzipper from 'unzipper';

const RETRIEVAL_DOWNLOAD_URL = "https://master.binary.ninja/headless-download";

try {
    const license = core.getInput('license');
    const extractPath = path.normalize(core.getInput('extract-path'));
    const downloadUrl = core.getInput('download-url');
    const useDevBranch = core.getInput('dev-branch').toLowerCase();
    const pythonSupport = core.getInput('python-support').toLowerCase() == "true";

    if (!fs.existsSync(extractPath)) throw Error("`extract-path` does not exist!");
    if (!fs.lstatSync(extractPath).isDirectory()) throw Error("`extract-path` is not a directory!");

    const installPath = path.join(extractPath, "/binaryninja/");
    core.setOutput("install-path", installPath);
    core.info("Installing Binary Ninja to: " + installPath);

    // Get unique download Url (unless overriden)
    if (downloadUrl == "") {
        got(RETRIEVAL_DOWNLOAD_URL,
            {
                searchParams: {
                    serial: license,
                    dev: useDevBranch
                }
            }
        ).json().then(retrievalData => {
            if (retrievalData.ok == false) throw Error(retrievalData.message);
            // Mask unique download Url
            core.setSecret(retrievalData.url);
            got.stream(retrievalData.url).pipe(unzipper.Extract({ path: extractPath }));
        });
    } else {
        core.info("Using download URL override...");
        got.stream(downloadUrl).pipe(unzipper.Extract({ path: extractPath }));
    }

    // Add Binary Ninja to python site-packages (if wanted)
    if (pythonSupport) {
        const pythonUserSitePkgDir = execSync("python -m site --user-site").toString("utf-8").trim();
        core.info("Adding Binary Ninja to user site-packages directory: " + pythonUserSitePkgDir);
        if (!fs.existsSync(pythonUserSitePkgDir)) {
            core.warning("User site-packages does not exist, creating it now...");
            fs.mkdirSync(pythonUserSitePkgDir, { recursive: true });
        }
        let pthContents = path.join(installPath, "/python/");
        fs.writeFileSync(pythonUserSitePkgDir + "/binaryninja.pth", pthContents, "utf-8");
    }
} catch (error) {
    core.setFailed(error.message);
}