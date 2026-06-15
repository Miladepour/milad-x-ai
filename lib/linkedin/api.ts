import { formatLinkedInError } from "@/lib/linkedin/errors";
import { getLinkedInApiVersion } from "@/lib/linkedin/config";

function linkedInHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": getLinkedInApiVersion(),
    "X-Restli-Protocol-Version": "2.0.0",
  };
}

async function linkedInError(step: string, response: Response): Promise<Error> {
  const detail = await response.text();
  return new Error(`${step}: ${formatLinkedInError(detail)}`);
}

export async function getLinkedInPersonUrn(accessToken: string): Promise<string> {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw await linkedInError("LinkedIn userinfo failed", response);
  }

  const data = (await response.json()) as { sub: string };
  return `urn:li:person:${data.sub}`;
}

export async function uploadLinkedInImage(
  accessToken: string,
  ownerUrn: string,
  imageBytes: ArrayBuffer
): Promise<string> {
  const initResponse = await fetch(
    "https://api.linkedin.com/rest/images?action=initializeUpload",
    {
      method: "POST",
      headers: {
        ...linkedInHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initializeUploadRequest: { owner: ownerUrn },
      }),
    }
  );

  if (!initResponse.ok) {
    throw await linkedInError("LinkedIn image init failed", initResponse);
  }

  const initData = (await initResponse.json()) as {
    value: { uploadUrl: string; image: string };
  };

  const uploadResponse = await fetch(initData.value.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "image/png",
    },
    body: imageBytes,
  });

  if (!uploadResponse.ok) {
    throw await linkedInError("LinkedIn image upload failed", uploadResponse);
  }

  return initData.value.image;
}

export async function createLinkedInImagePost(
  accessToken: string,
  authorUrn: string,
  commentary: string,
  imageUrn: string
): Promise<{ id?: string }> {
  const response = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      ...linkedInHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      author: authorUrn,
      commentary,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        media: {
          id: imageUrn,
          altText: "Course completion certificate",
        },
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!response.ok) {
    throw await linkedInError("LinkedIn post failed", response);
  }

  const postId = response.headers.get("x-restli-id");
  return { id: postId ?? undefined };
}
