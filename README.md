# Sach-AI

Sach-AI is a local deepfake-detection platform. Upload a video to receive an ensemble verdict, per-frame scores, a Grad-CAM heatmap, and a saved report.

The application runs three local services:

| Service | Technology | Address |
| --- | --- | --- |
| Web application | React, Vite, TypeScript | http://localhost:8080 |
| API | Express, TypeScript, SQLite | http://localhost:8787 |
| ML inference | FastAPI, PyTorch, OpenCV, ONNX Runtime | http://127.0.0.1:8600 |

## Requirements

- Node.js 20+ (Node 22 recommended)
- Python 3.11-3.13
- Around 3 GB free disk space for Python packages and model weights

Check your installed versions:

```powershell
node --version
npm.cmd --version
python --version
```

> **Windows PowerShell:** If `npm` reports that `npm.ps1` cannot run because script execution is disabled, use `npm.cmd` in all commands below. This avoids changing your PowerShell execution policy. In Command Prompt, Git Bash, macOS, or Linux, use `npm` normally.

## Run the project

From the project root, install the frontend and API dependencies:

```powershell
npm.cmd install
npm.cmd --prefix server install
```

Create the Python virtual environment and install the inference dependencies:

```powershell
python -m venv ml-service/.venv
ml-service\.venv\Scripts\python.exe -m pip install --upgrade pip
ml-service\.venv\Scripts\python.exe -m pip install -r ml-service/requirements.txt
```

Then start all services:

```powershell
npm.cmd run dev:all
```

Wait until the terminal shows all three addresses, then open http://localhost:8080 in a browser. Keep that terminal open while using the application. Press `Ctrl+C` to stop the services.

The API stores development data in `server/data/sach.db`; it is created automatically. Before starting the services, copy `server/.env.example` to `server/.env` and set `JWT_SECRET` to a random value. The example configuration points the API to the local ML service.

## Verify it is working

With `dev:all` still running, open this in PowerShell:

```powershell
Invoke-RestMethod http://localhost:8787/api/health
```

The response should show `status` as `ok`, `engine.primary` as `sach-model`, and the `lstm`, `faceSwap`, `generalist`, and `cevit` signals as available.

You can also use the browser at http://localhost:8080, create an account, and upload a supported video. A seeded development account may already exist:

```text
Email:    e2e@sach.ai
Password: e2epass123
```

## Run services separately

Use these when developing one part of the system:

```powershell
npm.cmd run dev          # frontend only
npm.cmd run dev:server   # API only
npm.cmd run dev:ml       # ML inference service only
```

## Useful checks

```powershell
npm.cmd run typecheck
npm.cmd --prefix server run typecheck
npm.cmd run build
npm.cmd test
```

## Model files

Model files are expected in `ml-service/models/`. Model weights are excluded from Git and must be supplied separately. Add these files before running a full scan:

- `model_97_acc_60_frames_FF_data.pt`
- `community_forensics_vit.onnx`
- `cross_efficient_vit.pth`
- `face_detection_yunet_2023mar.onnx`

If a model is unavailable, the health endpoint identifies it. If the ML service is not running, the API can use its local simulator, but it is not a real inference result.

## Troubleshooting

| Problem | Resolution |
| --- | --- |
| `npm.ps1 cannot be loaded` in PowerShell | Use `npm.cmd`, as shown above. |
| A port is already in use | Stop the previous `dev:all` terminal, or find the process with `netstat -ano | findstr :8080` (change the port as needed). |
| API says the engine is `demo` | Start the ML service with `npm.cmd run dev:ml`, or use `npm.cmd run dev:all`. |
| Python package installation fails | Confirm `python --version` is 3.11-3.13, then recreate `ml-service/.venv`. |
| First scan is slow | The ML models load on first use and CPU inference is expensive; later scans are faster. |

## Project structure

```text
src/           React frontend
server/        Express API, authentication, SQLite scan history
ml-service/    FastAPI inference service and model weights
tools/         Evaluation and benchmarking scripts
```
