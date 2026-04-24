Repository directory: C:\Users\Administrator\mamba\image
Task: investigate this incident and produce a full Root Cause Analysis report.
Follow your AGENTS.md constraints strictly (read-only, minimal scoped fix plan, side-effect analysis).

MongoDB ticket context:
{
  "requestId": "INC-20260424-072905-629",
  "reviewType": "Image Studio",
  "requestType": "Bug Report",
  "primaryChoice": "JGL",
  "status": "processing",
  "storage": {
    "route": "JGL",
    "imageCount": 0,
    "imageObjects": [],
    "inputArtifact": {
      "bucket": "local",
      "key": "JGL/input/INC-20260424-072905-629/payload.json",
      "fileName": "payload.json",
      "contentType": "application/json",
      "size": 219,
      "etag": null,
      "objectUrl": "file:///C:/Users/Administrator/mamba/backend/local_uploads/JGL/input/INC-20260424-072905-629/payload.json"
    },
    "outputArtifact": {
      "bucket": "local",
      "key": "JGL/output/INC-20260424-072905-629/response.json",
      "fileName": "response.json",
      "contentType": "application/json",
      "size": 35437,
      "etag": null,
      "objectUrl": "file:///C:/Users/Administrator/mamba/backend/local_uploads/JGL/output/INC-20260424-072905-629/response.json"
    },
    "logArtifacts": [
      {
        "bucket": "local",
        "key": "JGL/logs/INC-20260424-072905-629/app.log",
        "fileName": "app.log",
        "contentType": "text/plain",
        "size": 69,
        "etag": null,
        "objectUrl": "file:///C:/Users/Administrator/mamba/backend/local_uploads/JGL/logs/INC-20260424-072905-629/app.log"
      }
    ]
  },
  "artifactUrls": {
    "problems": [],
    "input": [
      "file:///C:/Users/Administrator/mamba/backend/local_uploads/JGL/input/INC-20260424-072905-629/payload.json"
    ],
    "output": [
      "file:///C:/Users/Administrator/mamba/backend/local_uploads/JGL/output/INC-20260424-072905-629/response.json"
    ],
    "logs": [
      "file:///C:/Users/Administrator/mamba/backend/local_uploads/JGL/logs/INC-20260424-072905-629/app.log"
    ]
  },
  "analysis": {
    "model": "moonshotai.kimi-k2.5",
    "imageCount": 0,
    "embeddingText": "[workflow_blocked] PNG compression failing in Image Studio. User reports that PNG files are not being compressed when using the Image Studio submission feature. The compression workflow appears to be failing or not producing expected output, blocking the user's ability to optimize image file sizes. System: Image Studio - a media processing and optimization platform for image compression and format conversion. Page: Image Studio submission/compression interface where users upload and compress image files. Code: unknown.",
    "structured": {
      "short_summary": "PNG compression failing in Image Studio",
      "structured_problem": "User reports that PNG files are not being compressed when using the Image Studio submission feature. The compression workflow appears to be failing or not producing expected output, blocking the user's ability to optimize image file sizes.",
      "error_type": "workflow_blocked",
      "system_context": "Image Studio - a media processing and optimization platform for image compression and format conversion",
      "page_context": "Image Studio submission/compression interface where users upload and compress image files",
      "error_code": "unknown",
      "severity": "medium",
      "image_evidence": [],
      "related_issues": [],
      "impact_scope": "Individual user workflow for PNG image compression",
      "impact_assessment": "User unable to compress PNG files, potentially affecting image optimization workflows and file size management for web or storage purposes",
      "preliminary_assessment": "Workflow blockage in Image Studio PNG compression feature. Root cause unknown - could be file validation failure, processing error, or UI state issue. Requires reproduction with specific file details and error logs.",
      "data_gaps": [
        "Specific error message displayed to user",
        "Whether issue affects all PNG files or specific ones",
        "File size or dimensions of affected PNGs",
        "Browser and OS environment",
        "Whether compression starts but fails or never initiates",
        "Expected vs actual file size output",
        "Whether other image formats (JPEG, WebP) compress successfully",
        "Timestamp of last successful PNG compression"
      ],
      "occurrence_hint": "unclear",
      "embedding_text": "[workflow_blocked] PNG compression failing in Image Studio. User reports that PNG files are not being compressed when using the Image Studio submission feature. The compression workflow appears to be failing or not producing expected output, blocking the user's ability to optimize image file sizes. System: Image Studio - a media processing and optimization platform for image compression and format conversion. Page: Image Studio submission/compression interface where users upload and compress image files. Code: unknown.",
      "triage_signals": {
        "route": "JGL",
        "submissionType": "Image Studio",
        "requestType": "Bug Report",
        "hasImages": false,
        "imageCount": 0,
        "shouldTriggerRca": false,
        "structuringComplete": true,
        "extractedFieldCount": 9
      }
    }
  }
}

Structured incident:
{
  "short_summary": "PNG compression failing in Image Studio",
  "structured_problem": "User reports that PNG files are not being compressed when using the Image Studio submission feature. The compression workflow appears to be failing or not producing expected output, blocking the user's ability to optimize image file sizes.",
  "error_type": "workflow_blocked",
  "system_context": "Image Studio - a media processing and optimization platform for image compression and format conversion",
  "page_context": "Image Studio submission/compression interface where users upload and compress image files",
  "error_code": "unknown",
  "severity": "medium",
  "image_evidence": [],
  "related_issues": [],
  "impact_scope": "Individual user workflow for PNG image compression",
  "impact_assessment": "User unable to compress PNG files, potentially affecting image optimization workflows and file size management for web or storage purposes",
  "preliminary_assessment": "Workflow blockage in Image Studio PNG compression feature. Root cause unknown - could be file validation failure, processing error, or UI state issue. Requires reproduction with specific file details and error logs.",
  "data_gaps": [
    "Specific error message displayed to user",
    "Whether issue affects all PNG files or specific ones",
    "File size or dimensions of affected PNGs",
    "Browser and OS environment",
    "Whether compression starts but fails or never initiates",
    "Expected vs actual file size output",
    "Whether other image formats (JPEG, WebP) compress successfully",
    "Timestamp of last successful PNG compression"
  ],
  "occurrence_hint": "unclear",
  "embedding_text": "[workflow_blocked] PNG compression failing in Image Studio. User reports that PNG files are not being compressed when using the Image Studio submission feature. The compression workflow appears to be failing or not producing expected output, blocking the user's ability to optimize image file sizes. System: Image Studio - a media processing and optimization platform for image compression and format conversion. Page: Image Studio submission/compression interface where users upload and compress image files. Code: unknown.",
  "triage_signals": {
    "route": "JGL",
    "submissionType": "Image Studio",
    "requestType": "Bug Report",
    "hasImages": false,
    "imageCount": 0,
    "shouldTriggerRca": false,
    "structuringComplete": true,
    "extractedFieldCount": 9
  }
}

Repository investigation brief:
[{'type': 'reasoning_content', 'reasoning_content': {'text': 'The user wants me to convert a structured incident JSON into a compact engineering brief with exactly four sections:\n1. Incident\n2. What To Inspect\n3. Failure Hypotheses\n4. Evidence To Confirm\n\nI need to extract the relevant information from the JSON and format it into these sections. Let me organize the information:\n\n**Incident**: This should cover the short summary, structured problem, system context, page context, error type, severity, and impact.\n\n**What To Inspect**: This should cover what areas/systems/logs to look at based on the system context, page context, and preliminary assessment.\n\n**Failure Hypotheses**: Based on the preliminary assessment and data gaps, what are the possible causes of the failure.\n\n**Evidence To Confirm**: Based on the data gaps, what specific evidence needs to be gathered to confirm or rule out hypotheses.\n\nLet me format this properly in Markdown.\n', 'signature': ''}}, {'type': 'text', 'text': '\n\n# Engineering Brief: PNG Compression Failure in Image Studio\n\n## Incident\n\n**Summary:** PNG compression failing in Image Studio  \n**System:** Image Studio - media processing and optimization platform for image compression and format conversion  \n**Page:** Image Studio submission/compression interface where users upload and compress image files  \n**Error Type:** Workflow blocked  \n**Severity:** Medium  \n**Impact:** User unable to compress PNG files, blocking image optimization workflows and file size management for web or storage purposes\n\n---\n\n## What To Inspect\n\n- **Image Studio compression workflow** - submission pipeline and processing logic\n- **File validation logic** - PNG-specific validation checks (format detection, header parsing)\n- **Compression engine/service** - PNG encoder implementation and error handling\n- **UI state management** - submission form state and error display logic\n- **Server-side processing logs** - request handling and compression job execution\n- **Configuration settings** - PNG compression enablement and parameter settings\n\n---\n\n## Failure Hypotheses\n\n1. **File validation failure** - PNG file not passing validation checks (corrupt header, unsupported color space, or metadata issue)\n2. **Processing error** - PNG compression engine encountering an unhandled exception or resource limit\n3. **Configuration issue** - PNG compression feature disabled or misconfigured in the system\n4. **UI state issue** - Frontend not properly initiating or tracking the compression workflow\n5. **Format-specific bug** - PNG handling code path differs from other formats (JPEG, WebP) and contains a defect\n\n---\n\n## Evidence To Confirm\n\n- [ ] Specific error message displayed to user (check browser console and UI)\n- [ ] Whether issue affects all PNG files or specific ones (test with different PNG samples)\n- [ ] File size and dimensions of affected PNGs\n- [ ] Browser and OS environment of the user\n- [ ] Whether compression starts but fails, or never initiates (network/console logs)\n- [ ] Expected vs actual file size output (if any output is produced)\n- [ ] Whether JPEG, WebP, or other formats compress successfully (compare behavior)\n- [ ] Timestamp of last successful PNG compression (check logs for historical success)\n- [ ] Server-side error logs for the specific request timestamp'}]

Use the MongoDB ticket context for extra evidence:
- inputArtifact and artifactUrls.input describe the submitted payload artifact
- outputArtifact and artifactUrls.output describe the saved model output artifact
- logArtifacts and artifactUrls.logs capture pipeline logs and failures/success messages

