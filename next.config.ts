/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  output: "export", // 정적 파일로 내보내기 설정

  // 깃허브 레포지토리 이름이 'Wordrobe'일 경우 basePath 설정
  // 웹 배포(GitHub Pages)시에만 적용하고, 앱(Capacitor) 빌드시에는 적용하지 않음
  basePath: isGithubPages ? "/Wordrobe" : "",

  // 이미지 최적화 끄기 (Next Image는 서버 없이 작동 안 함)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
