Repository directory: C:\Users\Administrator\mamba\image
Task: investigate this incident and produce a full Root Cause Analysis report.
Follow your AGENTS.md constraints strictly (read-only, minimal scoped fix plan, side-effect analysis).

MongoDB ticket context:
{
  "requestId": "INC-20260424-073556-409",
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
      "key": "JDI/input/INC-20260424-073556-409/payload.json",
      "fileName": "payload.json",
      "contentType": "application/json",
      "size": 216,
      "etag": null,
      "objectUrl": "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/input/INC-20260424-073556-409/payload.json"
    },
    "outputArtifact": {
      "bucket": "local",
      "key": "JDI/output/INC-20260424-073556-409/response.json",
      "fileName": "response.json",
      "contentType": "application/json",
      "size": 35191,
      "etag": null,
      "objectUrl": "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/output/INC-20260424-073556-409/response.json"
    },
    "logArtifacts": [
      {
        "bucket": "local",
        "key": "JDI/logs/INC-20260424-073556-409/app.log",
        "fileName": "app.log",
        "contentType": "text/plain",
        "size": 69,
        "etag": null,
        "objectUrl": "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/logs/INC-20260424-073556-409/app.log"
      }
    ]
  },
  "artifactUrls": {
    "problems": [],
    "input": [
      "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/input/INC-20260424-073556-409/payload.json"
    ],
    "output": [
      "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/output/INC-20260424-073556-409/response.json"
    ],
    "logs": [
      "file:///C:/Users/Administrator/mamba/backend/local_uploads/JDI/logs/INC-20260424-073556-409/app.log"
    ]
  },
  "analysis": {
    "model": "moonshotai.kimi-k2.5",
    "imageCount": 0,
    "embeddingText": "[workflow_blocked] Image Studio compression feature not functioning. User reports that the compression feature in Image Studio is not working. No supporting images were provided to show specific error states or UI behavior. The exact nature of the failure (error message, silent failure, incorrect output) is not specified. System: Image Studio - a media processing or image editing application with compression capabilities. Page: Image Studio compression workflow or settings screen. Code: unknown.",
    "structured": {
      "short_summary": "Image Studio compression feature not functioning",
      "structured_problem": "User reports that the compression feature in Image Studio is not working. No supporting images were provided to show specific error states or UI behavior. The exact nature of the failure (error message, silent failure, incorrect output) is not specified.",
      "error_type": "workflow_blocked",
      "system_context": "Image Studio - a media processing or image editing application with compression capabilities",
      "page_context": "Image Studio compression workflow or settings screen",
      "error_code": "unknown",
      "severity": "medium",
      "image_evidence": [],
      "related_issues": [],
      "impact_scope": "Individual user (af@gmail.com) attempting to use compression functionality in Image Studio",
      "impact_assessment": "User unable to complete image compression tasks, potentially blocking workflow that requires compressed image output",
      "preliminary_assessment": "Workflow blockage in Image Studio compression feature. Insufficient detail to determine root cause - could range from UI unresponsiveness to processing failure to incorrect output generation.",
      "data_gaps": [
        "Specific error message or behavior observed when compression fails",
        "Whether compression produces no output, incorrect output, or throws an error",
        "Image format and size being compressed",
        "Browser or application version being used",
        "Steps to reproduce the issue",
        "Whether issue is intermittent or consistent",
        "Any recent changes to the image or workflow prior to failure"
      ],
      "occurrence_hint": "unclear",
      "embedding_text": "[workflow_blocked] Image Studio compression feature not functioning. User reports that the compression feature in Image Studio is not working. No supporting images were provided to show specific error states or UI behavior. The exact nature of the failure (error message, silent failure, incorrect output) is not specified. System: Image Studio - a media processing or image editing application with compression capabilities. Page: Image Studio compression workflow or settings screen. Code: unknown.",
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
  "short_summary": "Image Studio compression feature not functioning",
  "structured_problem": "User reports that the compression feature in Image Studio is not working. No supporting images were provided to show specific error states or UI behavior. The exact nature of the failure (error message, silent failure, incorrect output) is not specified.",
  "error_type": "workflow_blocked",
  "system_context": "Image Studio - a media processing or image editing application with compression capabilities",
  "page_context": "Image Studio compression workflow or settings screen",
  "error_code": "unknown",
  "severity": "medium",
  "image_evidence": [],
  "related_issues": [],
  "impact_scope": "Individual user (af@gmail.com) attempting to use compression functionality in Image Studio",
  "impact_assessment": "User unable to complete image compression tasks, potentially blocking workflow that requires compressed image output",
  "preliminary_assessment": "Workflow blockage in Image Studio compression feature. Insufficient detail to determine root cause - could range from UI unresponsiveness to processing failure to incorrect output generation.",
  "data_gaps": [
    "Specific error message or behavior observed when compression fails",
    "Whether compression produces no output, incorrect output, or throws an error",
    "Image format and size being compressed",
    "Browser or application version being used",
    "Steps to reproduce the issue",
    "Whether issue is intermittent or consistent",
    "Any recent changes to the image or workflow prior to failure"
  ],
  "occurrence_hint": "unclear",
  "embedding_text": "[workflow_blocked] Image Studio compression feature not functioning. User reports that the compression feature in Image Studio is not working. No supporting images were provided to show specific error states or UI behavior. The exact nature of the failure (error message, silent failure, incorrect output) is not specified. System: Image Studio - a media processing or image editing application with compression capabilities. Page: Image Studio compression workflow or settings screen. Code: unknown.",
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
[{'type': 'reasoning_content', 'reasoning_content': {'text': 'The user wants me to convert a structured incident JSON into a compact engineering brief with exactly four sections:\n1. Incident\n2. What To Inspect\n3. Failure Hypotheses\n4. Evidence To Confirm\n\nI need to extract the relevant information from the JSON and format it appropriately.\n\nLet me organize the information:\n\n**Incident**: Image Studio compression feature not functioning - workflow blocked. User unable to complete image compression tasks.\n\n**What To Inspect**: \n- Image Studio compression workflow/settings screen\n- The compression functionality itself\n- Need to check: UI responsiveness, processing logic, output generation\n\n**Failure Hypotheses**:\nBased on the data gaps and preliminary assessment:\n1. UI unresponsiveness - the compression feature may not be responding to user input\n2. Processing failure - the compression process fails silently or with an error\n3. Incorrect output generation - compression runs but produces wrong output\n4. Could be format/size related\n5. Could be version/browser compatibility issue\n\n**Evidence To Confirm**:\n- Specific error message or behavior\n- Whether compression produces no output, incorrect output, or throws error\n- Image format and size\n- Browser/application version\n- Steps to reproduce\n- Whether intermittent or consistent\n- Recent changes prior to failure\n\nLet me format this as a clean Markdown brief.\n', 'signature': ''}}, {'type': 'text', 'text': '\n\n# Engineering Brief: Image Studio Compression Feature\n\n## Incident\n**Issue**: Image Studio compression feature not functioning  \n**Type**: Workflow blocked  \n**Severity**: Medium  \n**Impact**: User (af@gmail.com) unable to complete image compression tasks; workflow halted\n\n---\n\n## What To Inspect\n- **Component**: Image Studio compression workflow / settings screen\n- **Functionality**: Compression processing pipeline (input → processing → output)\n- **Entry Points**: Compression trigger button, settings configuration, file input handling\n- **Output Generation**: Check if compressed files are produced and saved correctly\n\n---\n\n## Failure Hypotheses\n1. **UI Unresponsiveness** – Compression UI fails to respond to user input or settings changes\n2. **Silent Processing Failure** – Compression runs without error but produces no output file\n3. **Incorrect Output** – Compression completes but generates corrupted or improperly compressed files\n4. **Format/Size Limitation** – Input image format or size exceeds supported limits without clear error\n5. **Version Incompatibility** – Browser or application version mismatch causing feature failure\n\n---\n\n## Evidence To Confirm\n- [ ] Specific error message displayed (if any)\n- [ ] Whether compression produces: no output / incorrect output / throws error\n- [ ] Image format and file size being compressed\n- [ ] Browser and application version in use\n- [ ] Exact steps to reproduce the issue\n- [ ] Issue consistency: intermittent vs. always reproducible\n- [ ] Any recent changes to image or workflow prior to failure'}]

Use the MongoDB ticket context for extra evidence:
- inputArtifact and artifactUrls.input describe the submitted payload artifact
- outputArtifact and artifactUrls.output describe the saved model output artifact
- logArtifacts and artifactUrls.logs capture pipeline logs and failures/success messages

