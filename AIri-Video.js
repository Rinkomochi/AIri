// Billable dimensions differ per model family:
// Each model's resolution is fixed by its variant name, and billing is
// centered around video seconds rendered.

const VIDEO_SECONDS_FIELD = {
  type: "number",
  unit: "second",
  description: { en: "Video generation unit price", zh: "视频生成单价" },
};

const RESOLUTION_DESCRIPTION = { en: "Output video resolution", zh: "输出视频分辨率" };

const INPUT_IMAGES_FIELD = {
  type: "number",
  unit: "count",
  description: { en: "Input image unit price", zh: "输入图片单价" },
};

const INPUT_VIDEO_SECONDS_FIELD = {
  type: "number",
  unit: "second",
  description: { en: "Input video unit price", zh: "输入视频单价" },
};

// Global fallback schema (union of all billable dimensions & resolutions)
const UNION_USAGE_SCHEMA = {
  seconds: VIDEO_SECONDS_FIELD,
  resolution: {
    enum: ["480P", "720P", "2K"],
    description: RESOLUTION_DESCRIPTION,
  },
  input_images: INPUT_IMAGES_FIELD,
  input_video_seconds: INPUT_VIDEO_SECONDS_FIELD,
};

// Model-specific profiles where resolution is strictly locked
function makeH3UsageSchema(resolution) {
  return {
    seconds: VIDEO_SECONDS_FIELD,
    resolution: {
      enum: [resolution],
      description: RESOLUTION_DESCRIPTION,
    },
    input_images: INPUT_IMAGES_FIELD,
    input_video_seconds: INPUT_VIDEO_SECONDS_FIELD,
  };
}

const H3_2K_USAGE_SCHEMA = makeH3UsageSchema("2K");
const H3_480P_USAGE_SCHEMA = makeH3UsageSchema("480P");
const H3_720P_USAGE_SCHEMA = makeH3UsageSchema("720P");

const GROK_USAGE_SCHEMA = {
  seconds: VIDEO_SECONDS_FIELD,
  resolution: {
    enum: ["480P", "720P"],
    description: RESOLUTION_DESCRIPTION,
  },
};

export const meta = {
  apiVersion: 1,
  key: "airi-video",
  name: "AIri Video",
  description: {
    en: "AIri video generation (text-to-video, image-to-video, and MiniMaxH3 multimodal reference)",
    zh: "AIri 视频生成（文生视频、图生视频、MiniMaxH3 多模态参考生视频）",
  },
  version: "1.1.0",
  author: { name: "AIri" },
  channelTypes: [88],
  models: [
    "MiniMaxH3-2k",
    "MiniMaxH3-2k-pro",
    "MiniMaxH3-480p",
    "MiniMaxH3-720p",
    "grok-imagine-video-1.5",
  ],
  fetchMode: "per_task",
  // Fallback for channel alias or general inspect
  usageSchema: UNION_USAGE_SCHEMA,
  usageExamples: [
    { label: "H3-2k 2K 5s", facts: { seconds: 5, resolution: "2K", input_images: 0, input_video_seconds: 0 } },
    { label: "H3-2k-pro 2K 5s", facts: { seconds: 5, resolution: "2K", input_images: 0, input_video_seconds: 0 } },
    { label: "H3-480p 480P 5s", facts: { seconds: 5, resolution: "480P", input_images: 0, input_video_seconds: 0 } },
    { label: "H3-720p 720P 5s", facts: { seconds: 5, resolution: "720P", input_images: 0, input_video_seconds: 0 } },
    { label: "grok 480P 6s", facts: { seconds: 6, resolution: "480P" } },
    { label: "grok 720P 6s", facts: { seconds: 6, resolution: "720P" } },
  ],
  usageProfiles: [
    {
      models: ["MiniMaxH3-2k"],
      schema: H3_2K_USAGE_SCHEMA,
      examples: [
        { label: "2K 5秒生成", facts: { seconds: 5, resolution: "2K", input_images: 0, input_video_seconds: 0 } },
        { label: "2K 10秒生成", facts: { seconds: 10, resolution: "2K", input_images: 0, input_video_seconds: 0 } },
      ],
    },
    {
      models: ["MiniMaxH3-2k-pro"],
      schema: H3_2K_USAGE_SCHEMA,
      examples: [
        { label: "2K Pro 5秒生成", facts: { seconds: 5, resolution: "2K", input_images: 0, input_video_seconds: 0 } },
        { label: "2K Pro 10秒生成", facts: { seconds: 10, resolution: "2K", input_images: 0, input_video_seconds: 0 } },
      ],
    },
    {
      models: ["MiniMaxH3-480p"],
      schema: H3_480P_USAGE_SCHEMA,
      examples: [
        { label: "480P 4秒生成", facts: { seconds: 4, resolution: "480P", input_images: 0, input_video_seconds: 0 } },
        { label: "480P 5秒生成", facts: { seconds: 5, resolution: "480P", input_images: 0, input_video_seconds: 0 } },
      ],
    },
    {
      models: ["MiniMaxH3-720p"],
      schema: H3_720P_USAGE_SCHEMA,
      examples: [
        { label: "720P 5秒生成", facts: { seconds: 5, resolution: "720P", input_images: 0, input_video_seconds: 0 } },
        { label: "720P 10秒生成", facts: { seconds: 10, resolution: "720P", input_images: 0, input_video_seconds: 0 } },
      ],
    },
    {
      models: ["grok-imagine-video-1.5"],
      schema: GROK_USAGE_SCHEMA,
      examples: [
        { label: "Grok 480P 6秒", facts: { seconds: 6, resolution: "480P" } },
        { label: "Grok 720P 6秒", facts: { seconds: 6, resolution: "720P" } },
      ],
    },
  ],
  protocols: [
    { name: "openai_responses", supports: ["stream", "sync", "background"] },
    "openai_video",
  ],
};

function trimmed(value) {
  return String(value || "").trim();
}

const H3_RESOLUTION_BY_MODEL = {
  "MiniMaxH3-2k": "2K",
  "MiniMaxH3-2k-pro": "2K",
  "MiniMaxH3-480p": "480P",
  "MiniMaxH3-720p": "720P",
};
const H3_FAMILY = "MiniMaxH3";
const H3_RESOLUTIONS = ["480P", "720P", "2K"];
const H3_MIN_DURATION = 4;
const H3_MAX_DURATION = 15;
const H3_DEFAULT_DURATION = 5;
const H3_MAX_FRAME_IMAGES = 2;
const H3_MAX_REFERENCE_IMAGES = 9;
const H3_MAX_REFERENCE_VIDEOS = 3;
const H3_MAX_REFERENCE_AUDIOS = 3;
const H3_MAX_INPUT_VIDEO_SECONDS = 15;
const H3_RATIOS = ["adaptive", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"];

const GROK_MODEL = "grok-imagine-video-1.5";
const GROK_DEFAULT_DURATION = 6;
const GROK_RESOLUTIONS = ["480P", "720P"];
const GROK_DEFAULT_RESOLUTION = "720P";

function h3ResolutionFor(model) {
  return Object.prototype.hasOwnProperty.call(H3_RESOLUTION_BY_MODEL, model)
    ? H3_RESOLUTION_BY_MODEL[model]
    : "";
}

function isH3(model) {
  return h3ResolutionFor(model) !== "";
}

function resolutionBucket(raw) {
  const value = String(raw || "").toUpperCase();
  if (value.includes("2K")) return "2K";
  if (value.includes("1080")) return "1080P";
  if (value.includes("768")) return "768P";
  if (value.includes("720")) return "720P";
  if (value.includes("480")) return "480P";
  return "";
}

function defaultResolution(model) {
  return h3ResolutionFor(model) || GROK_DEFAULT_RESOLUTION;
}

function resolutionFor(size, model) {
  const fixed = h3ResolutionFor(model);
  if (fixed) return fixed;
  return resolutionBucket(size) || defaultResolution(model);
}

function outboundDuration(req) {
  const n = Number(req && req.duration);
  if (Number.isFinite(n) && n > 0) return n;
  return GROK_DEFAULT_DURATION;
}

function outboundResolution(req, model) {
  if (req && req.resolution) return resolutionFor(req.resolution, model);
  const metadata = (req && req.metadata) || {};
  if (metadata.resolution) return resolutionFor(metadata.resolution, model);
  if (req && req.size) return resolutionFor(req.size, model);
  return defaultResolution(model);
}

function hasImageInput(req, hasInputReferenceFile) {
  if (hasInputReferenceFile) return true;
  const metadata = (req && req.metadata) || {};
  return Boolean(
    trimmed(req && req.input_reference) ||
      trimmed(req && req.image) ||
      (Array.isArray(req && req.images) && req.images.length) ||
      metadata.first_frame_image ||
      metadata.last_frame_image ||
      metadata.subject_reference
  );
}

function h3Duration(req) {
  const raw = req.duration;
  if (raw === undefined || raw === null || raw === "") return H3_DEFAULT_DURATION;
  const seconds = Number(raw);
  if (!Number.isInteger(seconds) || seconds < H3_MIN_DURATION || seconds > H3_MAX_DURATION) {
    throw new Error(
      H3_FAMILY +
        " duration must be an integer between " +
        H3_MIN_DURATION +
        " and " +
        H3_MAX_DURATION +
        " seconds"
    );
  }
  return seconds;
}

function h3Resolution(model, req) {
  const resolution = h3ResolutionFor(model);
  const metadata = req.metadata || {};
  const raw = trimmed(metadata.resolution) || trimmed(req.resolution) || trimmed(req.size);
  if (!raw) return resolution;
  if (resolutionBucket(raw) !== resolution) {
    throw new Error(model + " renders " + resolution + " only");
  }
  return resolution;
}

function h3MediaItem(type, url, role) {
  const item = { type: type, role: role };
  item[type] = { url: url };
  return item;
}

function h3MediaList(source, key) {
  const raw = source[key];
  if (raw === undefined || raw === null) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  return values.filter(function (value) {
    return value && typeof value === "object" ? true : Boolean(trimmed(value));
  });
}

function h3FrameImages(req) {
  const metadata = req.metadata || {};
  const images = h3MediaList(req, "images");
  if (images.length > H3_MAX_FRAME_IMAGES) {
    throw new Error(H3_FAMILY + " accepts at most " + H3_MAX_FRAME_IMAGES + " frame images");
  }
  const frames = [];
  if (metadata.first_frame_image) {
    frames.push(h3MediaItem("image_url", metadata.first_frame_image, "first_frame"));
  }
  if (metadata.last_frame_image) {
    frames.push(h3MediaItem("image_url", metadata.last_frame_image, "last_frame"));
  }
  if (frames.length) return frames;
  return images.map(function (url, index) {
    return h3MediaItem("image_url", url, index === 0 ? "first_frame" : "last_frame");
  });
}

function validateH3Content(items) {
  let hasText = false;
  let hasFrame = false;
  let hasReference = false;
  let firstFrames = 0;
  let lastFrames = 0;
  let referenceImages = 0;
  let referenceVideos = 0;
  let referenceAudios = 0;
  let inputImages = 0;
  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const role = trimmed(item.role);
    if (item.type === "text" && trimmed(item.text)) {
      hasText = true;
      continue;
    }
    if (item.type === "image_url") {
      inputImages += 1;
      if (!role || role === "first_frame") {
        firstFrames += 1;
        hasFrame = true;
      } else if (role === "last_frame") {
        lastFrames += 1;
        hasFrame = true;
      } else if (role === "middle_frame") {
        hasFrame = true;
      } else if (role === "reference_image") {
        referenceImages += 1;
        hasReference = true;
      }
      continue;
    }
    if (item.type === "video_url") {
      referenceVideos += 1;
      hasReference = true;
      continue;
    }
    if (item.type === "audio_url") {
      referenceAudios += 1;
      hasReference = true;
    }
  }
  if (!hasText) throw new Error(H3_FAMILY + " requires a non-empty text item");
  if (firstFrames > 1) throw new Error(H3_FAMILY + " accepts at most one first_frame image");
  if (lastFrames > 1) throw new Error(H3_FAMILY + " accepts at most one last_frame image");
  if (referenceImages > H3_MAX_REFERENCE_IMAGES) throw new Error(H3_FAMILY + " accepts at most " + H3_MAX_REFERENCE_IMAGES + " reference images");
  if (inputImages > H3_MAX_REFERENCE_IMAGES) throw new Error(H3_FAMILY + " accepts at most " + H3_MAX_REFERENCE_IMAGES + " input images");
  if (referenceVideos > H3_MAX_REFERENCE_VIDEOS) throw new Error(H3_FAMILY + " accepts at most " + H3_MAX_REFERENCE_VIDEOS + " reference videos");
  if (referenceAudios > H3_MAX_REFERENCE_AUDIOS) throw new Error(H3_FAMILY + " accepts at most " + H3_MAX_REFERENCE_AUDIOS + " reference audios");
  if (hasFrame && hasReference) throw new Error(H3_FAMILY + " cannot mix frame images with reference media");
  return items;
}

function h3Content(req) {
  const metadata = req.metadata || {};
  const prompt = trimmed(req.prompt);
  if (metadata.content !== undefined && metadata.content !== null) {
    if (!Array.isArray(metadata.content)) throw new Error("metadata.content must be an array");
    const items = metadata.content;
    const hasText = items.some(function (item) {
      return item && item.type === "text" && trimmed(item.text);
    });
    if (hasText) return validateH3Content(items);
    if (!prompt) throw new Error(H3_FAMILY + " metadata.content requires a text item or a prompt");
    return validateH3Content([{ type: "text", text: prompt }].concat(items));
  }
  const content = prompt ? [{ type: "text", text: prompt }] : [];
  for (const frame of h3FrameImages(req)) content.push(frame);
  const videos = h3MediaList(metadata, "reference_video");
  if (videos.length > H3_MAX_REFERENCE_VIDEOS) throw new Error(H3_FAMILY + " accepts at most " + H3_MAX_REFERENCE_VIDEOS + " reference videos");
  for (const video of videos) content.push(h3MediaItem("video_url", video, "reference_video"));
  const audios = h3MediaList(metadata, "reference_audio");
  if (audios.length > H3_MAX_REFERENCE_AUDIOS) throw new Error(H3_FAMILY + " accepts at most " + H3_MAX_REFERENCE_AUDIOS + " reference audios");
  for (const audio of audios) content.push(h3MediaItem("audio_url", audio, "reference_audio"));
  if (!content.length) throw new Error(H3_FAMILY + " requires a prompt or a media input");
  return validateH3Content(content);
}

function h3HasVisualContent(content) {
  return content.some(function (item) {
    return item && (item.type === "image_url" || item.type === "video_url");
  });
}

function h3Ratio(req, content) {
  const metadata = req.metadata || {};
  const ratio = trimmed(metadata.ratio);
  if (!ratio) return h3HasVisualContent(content) ? "adaptive" : "16:9";
  if (!H3_RATIOS.includes(ratio)) throw new Error(H3_FAMILY + " ratio must be one of " + H3_RATIOS.join(", "));
  if (ratio === "adaptive" && !h3HasVisualContent(content)) throw new Error(H3_FAMILY + " ratio adaptive requires an image or video input");
  return ratio;
}

function h3QueryTask(body) {
  const task = body && typeof body === "object" && !Array.isArray(body) ? body.task : null;
  return task && typeof task === "object" && !Array.isArray(task) ? task : null;
}

function h3APIError(body) {
  const error = body && typeof body === "object" && !Array.isArray(body) ? body.error : null;
  if (!error || typeof error !== "object" || Array.isArray(error)) return null;
  const message = trimmed(error.message);
  if (!message) return null;
  const statusCode = Number(error.http_code || error.code || 0);
  return { message: message, statusCode: Number.isInteger(statusCode) ? statusCode : 0 };
}

function validateModelCombo(model, duration, resolution) {
  if (isH3(model)) return;
  if (model !== GROK_MODEL) throw new Error("unsupported model: " + model);
  if (duration !== undefined && !(Number.isInteger(Number(duration)) && Number(duration) > 0)) {
    throw new Error(GROK_MODEL + " duration must be a positive integer number of seconds");
  }
  if (GROK_RESOLUTIONS.indexOf(resolution) < 0) throw new Error(GROK_MODEL + " resolution must be 480P or 720P");
}

function responsesInput(req) {
  const texts = [], images = [];
  const input = req.input;
  if (typeof input === "string") texts.push(input);
  else if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === "string") { texts.push(item); continue; }
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const content = item.content === undefined ? [item] : Array.isArray(item.content) ? item.content : [item.content];
      for (const part of content) {
        if (typeof part === "string") { texts.push(part); continue; }
        if (!part || typeof part !== "object" || Array.isArray(part)) continue;
        if (["input_text", "text"].includes(part.type) && typeof part.text === "string") texts.push(part.text);
        if (["input_image", "image_url"].includes(part.type)) {
          let image = part.image_url;
          if (image && typeof image === "object") image = image.url;
          if (trimmed(image)) images.push(trimmed(image));
        }
      }
    }
  }
  return {
    prompt: texts.filter(function (text) { return trimmed(text); }).join("\n"),
    images: images,
  };
}

function responsesVideoText(ctx) {
  const artifact = ctx && ctx.artifacts && ctx.artifacts.video;
  const url = trimmed(artifact && artifact.url);
  if (!url) throw new Error("video artifact is unavailable");
  const escaped = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return '<video controls src="' + escaped + '"></video>';
}

export function buildSubmitRequest(ctx) {
  const req = ctx.requestBody || {};
  const model = ctx.upstreamModel;
  const metadata = req.metadata || {};
  if (isH3(model)) {
    const content = h3Content(req);
    const h3Body = {
      model: model,
      content: content,
      resolution: h3Resolution(model, req),
      duration: h3Duration(req),
      ratio: h3Ratio(req, content),
    };
    ["callback_url", "aigc_watermark"].forEach(function (key) {
      if (metadata[key] !== undefined && metadata[key] !== null) h3Body[key] = metadata[key];
    });
    return {
      url: ctx.baseUrl + "/v2/video_generation",
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: "Bearer " + ctx.apiKey },
      body: h3Body,
      action: h3HasVisualContent(content) ? "image_to_video" : "text_to_video",
    };
  }
  const body = {
    model: model,
    prompt: req.prompt || undefined,
    duration: outboundDuration(req),
    resolution: outboundResolution(req, model),
  };
  ["prompt_optimizer", "fast_pretreatment", "callback_url", "aigc_watermark", "first_frame_image", "last_frame_image", "subject_reference"].forEach(
    function (key) {
      if (metadata[key] !== undefined && metadata[key] !== null) body[key] = metadata[key];
    }
  );
  return {
    url: ctx.baseUrl + "/v1/video_generation",
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: "Bearer " + ctx.apiKey },
    body: body,
    action: hasImageInput(req, false) ? "image_to_video" : "text_to_video",
  };
}

export function parseSubmitResponse(ctx, resp) {
  const body = resp.body || {};
  const apiError = isH3(ctx.upstreamModel) ? h3APIError(body) : null;
  if (apiError) throw new Error(apiError.message);
  const base = body.base_resp;
  if (base) {
    if (base.status_code !== 0) throw new Error(base.status_msg || "video submit failed");
  } else if (!isH3(ctx.upstreamModel)) {
    throw new Error("video submit failed");
  }
  if (!body.task_id) throw new Error("missing task_id");
  return { taskId: body.task_id, taskData: body };
}

// -----------------------------------------------------------------------------
// [Pre-authorization / Quota Hold]
// 提取用户请求的秒数进行预冻结，防止 0 余额恶意逃单。
// -----------------------------------------------------------------------------
export function extractUsage(ctx) {
  if (ctx.usagePurpose === "billing_ratios") return null;
  const req = ctx.requestBody || {};
  const model = ctx.upstreamModel || req.model;
  if (isH3(model)) {
    const content = h3Content(req);
    return {
      seconds: h3Duration(req),
      resolution: h3Resolution(model, req),
      input_images: content.filter(function (item) {
        return item && item.type === "image_url";
      }).length,
      input_video_seconds: content.some(function (item) {
        return item && item.type === "video_url";
      })
        ? H3_MAX_INPUT_VIDEO_SECONDS
        : 0,
    };
  }
  return {
    seconds: outboundDuration(req),
    resolution: outboundResolution(req, model),
    input_images: 0,
    input_video_seconds: 0,
  };
}

export function buildQueryRequest(ctx) {
  const path = isH3(ctx.upstreamModel || ctx.model)
    ? "/v2/query/video_generation/" + encodeURIComponent(ctx.taskId)
    : "/v1/query/video_generation?task_id=" + encodeURIComponent(ctx.taskId);
  return {
    url: ctx.baseUrl + path,
    method: "GET",
    headers: { Accept: "application/json", Authorization: "Bearer " + ctx.apiKey },
  };
}

export function parseTaskResult(ctx, body) {
  const apiError = h3APIError(body);
  if (apiError) {
    if (apiError.statusCode === 408 || apiError.statusCode === 429 || apiError.statusCode >= 500) {
      throw new Error(apiError.message);
    }
    return { code: apiError.statusCode, status: "FAILURE", progress: "100%", reason: apiError.message };
  }
  const h3Task = h3QueryTask(body);
  if (h3Task) {
    const h3Statuses = {
      queued: "QUEUED",
      running: "IN_PROGRESS",
      succeeded: "SUCCESS",
      failed: "FAILURE",
      cancelled: "FAILURE",
    };
    const h3Status = h3Statuses[h3Task.status];
    if (!h3Status) {
      return { status: "UNKNOWN", reason: "unrecognized status: " + String(h3Task.status || "") };
    }
    const h3Result = {
      code: 0,
      status: h3Status,
      progress: h3Status === "QUEUED" ? "30%" : h3Status === "IN_PROGRESS" ? "50%" : "100%",
    };
    if (h3Status === "SUCCESS") {
      const url = trimmed(h3Task.content && h3Task.content.url);
      if (url) h3Result.url = url;
    }
    if (h3Status === "FAILURE") {
      h3Result.reason = trimmed(h3Task.error && h3Task.error.message) || "task " + trimmed(h3Task.status);
    }
    return h3Result;
  }
  if (body.base_resp && body.base_resp.status_code !== 0) {
    return { code: body.base_resp.status_code || 0, status: "FAILURE", progress: "100%", reason: body.base_resp.status_msg || "" };
  }
  const base = body.base_resp || {};
  const statuses = {
    Preparing: "IN_PROGRESS",
    Queueing: "IN_PROGRESS",
    Processing: "IN_PROGRESS",
    Success: "SUCCESS",
    Fail: "FAILURE",
  };
  const status = statuses[body.status];
  if (!status) {
    return { status: "UNKNOWN", reason: "unrecognized status: " + String(body.status || "") };
  }
  const progress = status === "SUCCESS" || status === "FAILURE" ? "100%" : body.status === "Processing" ? "50%" : "30%";
  const reason = status === "FAILURE" ? "task failed" : "";
  return { code: base.status_code || 0, status: status, progress: progress, reason: reason };
}

function artifactData(ctx) {
  const data = (ctx && ctx.data) || {};
  if (data.data && typeof data.data === "object" && data.data.task_id && Object.prototype.hasOwnProperty.call(data.data, "data")) {
    return data.data.data || {};
  }
  return data;
}

function artifactFileID(ctx) {
  return trimmed(artifactData(ctx).file_id);
}

function h3ArtifactURL(ctx) {
  const task = h3QueryTask(artifactData(ctx));
  return task ? trimmed(task.content && task.content.url) : "";
}

export function listArtifacts(task) {
  if (task.status !== "SUCCESS") return [];
  return artifactFileID(task) || h3ArtifactURL(task) ? [{ key: "video", type: "video", mimeType: "video/mp4" }] : [];
}

export function buildContentRequest(ctx) {
  if (ctx.artifactKey !== "video") throw new Error("artifact_not_found");
  const fileID = artifactFileID(ctx);
  if (!fileID) {
    const url = h3ArtifactURL(ctx);
    if (!url) throw new Error("artifact_not_found");
    return { url: url, method: ctx.clientRequest.method, credentialless: true };
  }
  return {
    url: ctx.baseUrl + "/v1/files/download?file_id=" + encodeURIComponent(fileID),
    method: ctx.clientRequest.method,
    headers: { Accept: "video/*", Authorization: "Bearer " + ctx.apiKey },
  };
}


export function extractUsageOnComplete(task, _taskResult, body) {
  const h3Task = h3QueryTask(body);
  if (h3Task) {
    const taskModel = (task && (task.model || (task.properties && task.properties.origin_model_name))) || "";
    const resolution = trimmed(h3Task.resolution).toUpperCase() || h3ResolutionFor(taskModel);
    const facts = {};
    if (resolution && H3_RESOLUTIONS.includes(resolution)) {
      facts.resolution = resolution;
    }
    const usage = h3Task.usage && typeof h3Task.usage === "object" && !Array.isArray(h3Task.usage) ? h3Task.usage : {};
    const fields = [
      { key: "seconds", value: usage.output_seconds, minimum: H3_MIN_DURATION, maximum: H3_MAX_DURATION, integer: false },
      { key: "input_images", value: usage.input_image_count, minimum: 0, maximum: H3_MAX_REFERENCE_IMAGES, integer: true },
      { key: "input_video_seconds", value: usage.input_seconds, minimum: 0, maximum: H3_MAX_INPUT_VIDEO_SECONDS, integer: false },
    ];
    for (const field of fields) {
      if (field.value === undefined || field.value === null || field.value === "") continue;
      const value = Number(field.value);
      if (!Number.isFinite(value) || value < field.minimum || value > field.maximum || (field.integer && !Number.isInteger(value))) {
        continue;
      }
      facts[field.key] = value;
    }
    return Object.keys(facts).length ? facts : null;
  }

  // grok / flat query
  const width = Number((body || {}).video_width || 0);
  const height = Number((body || {}).video_height || 0);
  const facts = {};
  if (width > 0 && height > 0) {
    facts.resolution = resolutionFor(width + "x" + height, GROK_MODEL);
  }
  const dur = Number((body && (body.duration || body.video_duration)) || 0);
  if (Number.isFinite(dur) && dur > 0) {
    facts.seconds = dur;
  }
  return Object.keys(facts).length ? facts : null;
}

export const protocols = {
  openai_responses: {
    decodeRequest: function (ctx) {
      if (!ctx.body || ctx.body.kind !== "json") throw new Error("JSON body required");
      const req = ctx.body.value;
      if (!req || typeof req !== "object" || Array.isArray(req)) throw new Error("request body must be an object");
      const model = trimmed(req.model);
      if (!model) throw new Error("model is required");
      if (req.input !== undefined && typeof req.input !== "string" && !Array.isArray(req.input)) {
        throw new Error("input must be a string or array");
      }
      if (req.images !== undefined && !Array.isArray(req.images)) {
        throw new Error("images must be an array");
      }
      if (req.metadata !== undefined && (!req.metadata || typeof req.metadata !== "object" || Array.isArray(req.metadata))) {
        throw new Error("metadata must be an object");
      }
      const input = responsesInput(req);
      const prompt = input.prompt || trimmed(req.prompt);
      const images = [];
      for (const image of [req.image, req.input_reference].concat(req.images || [], input.images)) {
        if (trimmed(image) && !images.includes(trimmed(image))) images.push(trimmed(image));
      }
      if (!prompt && images.length === 0) throw new Error("input is required");
      const metadata = Object.assign({}, req.metadata || {});
      if (images.length && !metadata.first_frame_image) metadata.first_frame_image = images[0];
      if (images.length > 1 && !metadata.last_frame_image) metadata.last_frame_image = images[1];
      const requestBody = { model: model, prompt: prompt, metadata: metadata };
      if (images.length) requestBody.images = images;
      if (Object.prototype.hasOwnProperty.call(req, "seconds")) requestBody.duration = req.seconds;
      else if (Object.prototype.hasOwnProperty.call(req, "duration")) requestBody.duration = req.duration;
      if (Object.prototype.hasOwnProperty.call(req, "size")) requestBody.size = req.size;
      else if (Object.prototype.hasOwnProperty.call(req, "resolution")) requestBody.size = req.resolution;
      return {
        kind: "submit",
        model: model,
        action: images.length ? "image_to_video" : "text_to_video",
        requestBody: requestBody,
      };
    },
    renderEvents: function (ctx, task, previousState) {
      const status = String(task.status || "UNKNOWN").toUpperCase();
      const value = Number(String(task.progress || "").replace("%", ""));
      const progress = Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
      const state = { status: status, progress: progress };
      if (status === "SUCCESS") {
        const text = responsesVideoText(ctx);
        const events = previousState && previousState.status === status ? [] : [{ type: "output", data: text }];
        return { events: events, state: state, done: true };
      }
      if (status === "FAILURE") {
        return {
          events: [{ type: "error", code: "task_failed", message: task.fail_reason || "task failed" }],
          state: state,
          done: true,
        };
      }
      if (previousState && previousState.status === status && previousState.progress === progress) {
        return { events: [], state: state, done: false };
      }
      const event = { type: "progress", message: status.toLowerCase() };
      if (progress !== null) event.progress = progress;
      return { events: [event], state: state, done: false };
    },
    renderFinal: function (ctx, _task) {
      return {
        output: [
          {
            type: "message",
            status: "completed",
            role: "assistant",
            content: [{ type: "output_text", text: responsesVideoText(ctx), annotations: [], logprobs: [] }],
          },
        ],
        metadata: { vendor: "airi-video" },
      };
    },
  },
};

const legacyRenderers = {
  openai_video: function (task) {
    const statuses = {
      NOT_START: "queued",
      SUBMITTED: "queued",
      QUEUED: "queued",
      IN_PROGRESS: "in_progress",
      SUCCESS: "completed",
      FAILURE: "failed",
    };
    const output = {
      id: task.task_id,
      object: "video",
      model: task.properties && task.properties.origin_model_name ? task.properties.origin_model_name : "",
      status: statuses[task.status] || "unknown",
      progress: Number(String(task.progress || "0").replace("%", "")),
      created_at: task.created_at,
    };
    if (task.updated_at) output.completed_at = task.updated_at;
    if (task.data && task.data.base_resp && task.data.base_resp.status_code !== 0) {
      output.error = { message: task.data.base_resp.status_msg, code: String(task.data.base_resp.status_code) };
    }
    return output;
  },
};

protocols.openai_video = {
  decodeRequest: function (ctx) {
    if (!ctx.body || (ctx.body.kind !== "json" && ctx.body.kind !== "multipart")) {
      throw new Error("JSON or multipart body required");
    }
    let req;
    let hasInputReferenceFile = false;
    if (ctx.body.kind === "json") {
      if (!ctx.body.value || Array.isArray(ctx.body.value)) throw new Error("JSON object required");
      req = Object.assign({}, ctx.body.value);
    } else {
      const first = function (name) {
        const values = (ctx.body.fields || {})[name] || [];
        if (values.length > 1) throw new Error(name + " must be provided once");
        return values[0];
      };
      req = {};
      const fields = ctx.body.fields || {};
      for (const name of Object.keys(fields)) {
        req[name] = first(name);
      }
      for (const file of ctx.body.files || []) {
        if (file.field !== "input_reference") throw new Error("unexpected file field: " + file.field);
        if (hasInputReferenceFile) throw new Error("input_reference must be provided once");
        hasInputReferenceFile = true;
      }
      if (req.metadata !== undefined) {
        let parsed;
        try {
          parsed = JSON.parse(req.metadata);
        } catch (e) {
          throw new Error("metadata must be a JSON object string");
        }
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("metadata must be a JSON object string");
        }
        req.metadata = parsed;
      }
      if (req.seconds !== undefined) req.seconds = Number(req.seconds);
      else if (req.duration !== undefined) req.seconds = Number(req.duration);
    }
    const seconds = req.seconds === undefined ? req.duration : req.seconds;
    if (seconds !== undefined) req.duration = Number(seconds);
    if (hasInputReferenceFile) {
      req.metadata = Object.assign({}, req.metadata || {}, {
        first_frame_image: { __fileRef: "request_file:input_reference", encoding: "dataUrl", maxBytes: 20971520 },
      });
    } else {
      const image = trimmed(req.input_reference || req.image);
      if (image) {
        req.metadata = Object.assign({}, req.metadata || {});
        if (!req.metadata.first_frame_image) req.metadata.first_frame_image = image;
      }
    }
    const hasImage = hasImageInput(req, hasInputReferenceFile);
    const duration = req.duration === undefined ? undefined : Number(req.duration);
    const comboModel = ctx.upstreamModel || ctx.model;
    validateModelCombo(comboModel, duration, outboundResolution(req, comboModel));
    return {
      kind: "submit",
      model: ctx.model,
      action: hasImage ? "image_to_video" : "text_to_video",
      requestBody: Object.assign({}, req, { model: ctx.model }),
    };
  },
  render: function (ctx, task) {
    return legacyRenderers.openai_video(task);
  },
};
