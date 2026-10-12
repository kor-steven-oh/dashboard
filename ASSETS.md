# 배경 영상 출처

ver.2는 Apple의 **Tahoe Light** 파란 물결 화면보호기 원본을 사용합니다. Lake Tahoe의 산·호숫가 항공 촬영 영상과는 다른 추상 물결 배경입니다.

- 제작 및 원본 권리: Apple Inc.
- [Tahoe Light 원본 영상](https://sylvan.apple.com/itunes-assets/Aerials116/v4/cb/5b/50/cb5b5035-6701-619f-9065-3d7d0e5fbef4/tahoe-light-landscape.mov)
- 출처 확인: macOS의 `NeptuneOneWallpaper.appex/Contents/Resources/manifest.json`에 있는 `lightLandscapeRemoteURL`.
- 확인한 원본 형식: HEVC, 3840×2160, 240fps, 약 60초, 45,172,491 bytes.
- [Liquid Glass 디자인 참고 — Apple](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)

## 프로젝트에 포함한 파일

| 파일 | 내용 |
| --- | --- |
| `assets/tahoe-light-web.mp4` | 같은 원본 60초 전체를 H.264 / 1600×900 / 30fps로 변환한 호환본. 장면·색상·재생 속도를 변경하지 않음. |
| `assets/tahoe-light-poster.jpg` | 원본 영상의 첫 프레임을 1600×900 JPEG로 추출한 로딩·정지용 이미지. |
| `sample.png` | 사용자가 제공한 대시보드 레이아웃 참고 이미지. 실제 화면은 HTML·CSS·SVG로 구현. |

원본은 Apple CDN에서 직접 연결하고, 로컬 호환본은 원본 재생이 지원되지 않거나 네트워크 연결이 불가능할 때 사용합니다. 외부 배경 에셋의 권리는 원저작자에게 있으며 이 저장소가 별도의 이용 권리를 부여하지 않습니다.

## 재생성 명령

```sh
curl -fL -o /tmp/tahoe-light-original.mov \
  'https://sylvan.apple.com/itunes-assets/Aerials116/v4/cb/5b/50/cb5b5035-6701-619f-9065-3d7d0e5fbef4/tahoe-light-landscape.mov'

ffmpeg -i /tmp/tahoe-light-original.mov \
  -vf 'fps=30,scale=1600:-2' -c:v libx264 -preset fast -crf 24 \
  -pix_fmt yuv420p -movflags +faststart -an assets/tahoe-light-web.mp4

ffmpeg -i /tmp/tahoe-light-original.mov -frames:v 1 \
  -vf 'scale=1600:-2' -q:v 3 -update 1 assets/tahoe-light-poster.jpg
```

## 글꼴

모든 화면 텍스트는 [Pretendard](https://github.com/orioncactus/pretendard/tree/v1.3.9) v1.3.9 가변 폰트를 사용합니다. `assets/fonts/PretendardVariable.woff2`로 로컬 제공하며, 지원 굵기는 45–920입니다. 원본 SIL Open Font License 1.1과 저작권 고지는 `assets/fonts/OFL.txt`에 포함했습니다.
