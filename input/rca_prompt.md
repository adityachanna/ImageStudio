Repository directory: C:\Users\Administrator\mamba\image
Task: investigate this incident and produce a full Root Cause Analysis report.
Follow your AGENTS.md constraints strictly (read-only, minimal scoped fix plan, side-effect analysis).

MongoDB ticket context:
{
  "requestId": "INC-20260424-052044-835",
  "reviewType": "Image Studio",
  "requestType": "Bug Report",
  "primaryChoice": "JDI",
  "status": "processing",
  "storage": {
    "route": "JDI",
    "imageCount": 0,
    "imageObjects": [],
    "inputArtifact": {
      "bucket": "local",
      "key": "JDI/input/INC-20260424-052044-835/payload.json",
      "fileName": "payload.json",
      "contentType": "application/json",
      "size": 224,
      "etag": null,
      "objectUrl": "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/input/INC-20260424-052044-835/payload.json"
    },
    "outputArtifact": {
      "bucket": "local",
      "key": "JDI/output/INC-20260424-052044-835/response.json",
      "fileName": "response.json",
      "contentType": "application/json",
      "size": 35071,
      "etag": null,
      "objectUrl": "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/output/INC-20260424-052044-835/response.json"
    },
    "logArtifacts": [
      {
        "bucket": "local",
        "key": "JDI/logs/INC-20260424-052044-835/app.log",
        "fileName": "app.log",
        "contentType": "text/plain",
        "size": 69,
        "etag": null,
        "objectUrl": "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/logs/INC-20260424-052044-835/app.log"
      }
    ]
  },
  "artifactUrls": {
    "problems": [],
    "input": [
      "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/input/INC-20260424-052044-835/payload.json"
    ],
    "output": [
      "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/output/INC-20260424-052044-835/response.json"
    ],
    "logs": [
      "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/logs/INC-20260424-052044-835/app.log"
    ]
  },
  "analysis": {
    "model": "moonshotai.kimi-k2.5",
    "imageCount": 0,
    "embeddingText": "[content_issue] Image compression issue in Image Studio. User reports a compression issue in Image Studio. The specific nature of the compression problem (quality degradation, file size, format conversion, or processing failure) is not detailed in the submission. System: Image Studio - a content creation and image editing platform. Page: Image Studio interface, likely during image processing or export workflow. Code: unknown.",
    "structured": {
      "short_summary": "Image compression issue in Image Studio",
      "structured_problem": "User reports a compression issue in Image Studio. The specific nature of the compression problem (quality degradation, file size, format conversion, or processing failure) is not detailed in the submission.",
      "error_type": "content_issue",
      "system_context": "Image Studio - a content creation and image editing platform",
      "page_context": "Image Studio interface, likely during image processing or export workflow",
      "error_code": "unknown",
      "severity": "medium",
      "image_evidence": [],
      "related_issues": [],
      "impact_scope": "Individual user (aditya@email.com) attempting to use image compression functionality",
      "impact_assessment": "User workflow blocked or degraded due to unspecified compression issue; impact limited to single user until scope is clarified",
      "preliminary_assessment": "Content processing issue in Image Studio related to image compression functionality. Insufficient detail provided to determine if this is a quality issue, file size issue, format conversion failure, or complete processing failure.",
      "data_gaps": [
        "Specific nature of compression issue (quality loss, file size unexpected, format error, processing failure)",
        "Exact workflow step where issue occurs",
        "Expected vs actual compression results",
        "Image format and size being processed",
        "Error messages or visual artifacts observed",
        "Browser and OS environment",
        "Frequency of occurrence (one-time or reproducible)",
        "Specific Image Studio feature being used (export, save, batch processing)"
      ],
      "occurrence_hint": "unclear",
      "embedding_text": "[content_issue] Image compression issue in Image Studio. User reports a compression issue in Image Studio. The specific nature of the compression problem (quality degradation, file size, format conversion, or processing failure) is not detailed in the submission. System: Image Studio - a content creation and image editing platform. Page: Image Studio interface, likely during image processing or export workflow. Code: unknown.",
      "triage_signals": {
        "route": "JDI",
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
  "short_summary": "Image compression issue in Image Studio",
  "structured_problem": "User reports a compression issue in Image Studio. The specific nature of the compression problem (quality degradation, file size, format conversion, or processing failure) is not detailed in the submission.",
  "error_type": "content_issue",
  "system_context": "Image Studio - a content creation and image editing platform",
  "page_context": "Image Studio interface, likely during image processing or export workflow",
  "error_code": "unknown",
  "severity": "medium",
  "image_evidence": [],
  "related_issues": [],
  "impact_scope": "Individual user (aditya@email.com) attempting to use image compression functionality",
  "impact_assessment": "User workflow blocked or degraded due to unspecified compression issue; impact limited to single user until scope is clarified",
  "preliminary_assessment": "Content processing issue in Image Studio related to image compression functionality. Insufficient detail provided to determine if this is a quality issue, file size issue, format conversion failure, or complete processing failure.",
  "data_gaps": [
    "Specific nature of compression issue (quality loss, file size unexpected, format error, processing failure)",
    "Exact workflow step where issue occurs",
    "Expected vs actual compression results",
    "Image format and size being processed",
    "Error messages or visual artifacts observed",
    "Browser and OS environment",
    "Frequency of occurrence (one-time or reproducible)",
    "Specific Image Studio feature being used (export, save, batch processing)"
  ],
  "occurrence_hint": "unclear",
  "embedding_text": "[content_issue] Image compression issue in Image Studio. User reports a compression issue in Image Studio. The specific nature of the compression problem (quality degradation, file size, format conversion, or processing failure) is not detailed in the submission. System: Image Studio - a content creation and image editing platform. Page: Image Studio interface, likely during image processing or export workflow. Code: unknown.",
  "triage_signals": {
    "route": "JDI",
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
[{'type': 'reasoning_content', 'reasoning_content': {'text': 'The user wants me to convert a structured incident JSON into a compact engineering brief with exactly four sections:\n1. Incident\n2. What To Inspect\n3. Failure Hypotheses\n4. Evidence To Confirm\n\nI need to extract the relevant information from the JSON and format it appropriately.\n\nLet me organize the information:\n\n**Incident:**\n- Image compression issue in Image Studio\n- User: aditya@email.com\n- System: Image Studio (content creation and image editing platform)\n- Page: Image Studio interface, likely during image processing or export workflow\n- Severity: medium\n- Error type: content_issue\n- Impact: Individual user workflow blocked or degraded\n\n**What To Inspect:**\n- Image Studio compression functionality\n- Export workflow\n- Image processing pipeline\n- Quality settings\n- File size handling\n- Format conversion\n\n**Failure Hypotheses:**\nBased on the data gaps and preliminary assessment:\n1. Quality degradation during compression\n2. Unexpected file size after compression\n3. Format conversion failure\n4. Complete processing failure\n5. Export workflow issue\n\n**Evidence To Confirm:**\n- Specific nature of compression issue\n- Exact workflow step\n- Expected vs actual results\n- Image format and size\n- Error messages\n- Browser and OS\n- Frequency\n- Specific feature used\n\nLet me format this as a clean Markdown brief.\n', 'signature': ''}}, {'type': 'text', 'text': "\n\n# Engineering Brief: Image Compression Issue in Image Studio\n\n## Incident\n\n| Field | Value |\n|-------|-------|\n| **Summary** | Image compression issue in Image Studio |\n| **User** | aditya@email.com |\n| **System** | Image Studio (content creation and image editing platform) |\n| **Context** | Image Studio interface during image processing or export workflow |\n| **Severity** | Medium |\n| **Error Type** | Content Issue |\n| **Impact** | Individual user workflow blocked or degraded due to unspecified compression issue |\n\n---\n\n## What To Inspect\n\n- **Compression module** in Image Studio's image processing pipeline\n- **Export workflow** — specifically the save/export functionality\n- **Quality settings** applied during compression operations\n- **Format conversion logic** (if applicable)\n- **File size handling** during the compression process\n- **Error handling** paths in the compression/export code paths\n\n---\n\n## Failure Hypotheses\n\n1. **Quality Degradation** — Compression algorithm producing unacceptable quality loss\n2. **File Size Issue** — Output file size unexpected (too large or too small)\n3. **Format Conversion Failure** — Unable to convert between formats (JPEG, PNG, WebP, etc.)\n4. **Processing Failure** — Compression process crashes or hangs mid-operation\n5. **Export Pipeline Bug** — Issue in the export workflow preventing compression completion\n\n---\n\n## Evidence To Confirm\n\n- [ ] Specific compression issue type (quality, size, format, or failure)\n- [ ] Exact workflow step where issue occurs (export, save, batch process)\n- [ ] Expected vs. actual compression results\n- [ ] Image format and file size being processed\n- [ ] Error messages or visual artifacts observed\n- [ ] Browser and OS environment details\n- [ ] Frequency of occurrence (one-time or reproducible)\n- [ ] Specific Image Studio feature in use (export, save, batch processing)"}]

Use the MongoDB ticket context for extra evidence:
- inputArtifact and artifactUrls.input describe the submitted payload artifact
- outputArtifact and artifactUrls.output describe the saved model output artifact
- logArtifacts and artifactUrls.logs capture pipeline logs and failures/success messages

