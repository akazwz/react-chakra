import { nodeClient, uploadClient } from "~/client/connect";

/**
 * 计算文件的SHA-256 hash
 */
export async function calculateFileHash(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function uploadFile(file: File) {
	const hash = await calculateFileHash(file);
	const response = await uploadClient.checkFileHash({ fileHash: hash });
	if (response.exists) {
		return response.exists;
	}
}
