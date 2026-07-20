import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";

// 랜딩 페이지 — 서비스 소개 + 로그인/가입 CTA
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* 헤더 */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-pine-dk">
            GRADE <span className="text-pine">UP</span>
          </Link>
          <nav className="flex items-center gap-3">
            <LinkButton href="/login" variant="ghost">
              로그인
            </LinkButton>
            <LinkButton href="/signup">무료로 시작하기</LinkButton>
          </nav>
        </div>
      </header>

      {/* 히어로 */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <p className="mb-4 inline-block rounded-full bg-pine-bg px-3 py-1 text-xs font-semibold text-pine">
          KCGS ESG 평가대응 AI SaaS
        </p>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          보고서 하나로,
          <br />
          <span className="text-pine">등급이 보입니다</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-subtext">
          지속가능경영보고서 PDF를 업로드하면 AI가 KCGS 평가지표 24개의 충족 여부를
          진단하고, 만점 달성을 위한 개선과제를 우선순위로 제시합니다. 데이터 입력
          없이, 이미 있는 문서로 5분 만에 시작하세요.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/signup" className="h-12 px-6 text-base">
            지금 무료 진단 받기
          </LinkButton>
          <LinkButton href="/login" variant="secondary" className="h-12 px-6 text-base">
            로그인
          </LinkButton>
        </div>
      </section>

      {/* 특징 3가지 */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "입력하는 SaaS가 아니라, 읽어주는 SaaS",
              body: "수개월의 데이터 입력 없이 이미 발간한 보고서를 AI가 읽고 5분 만에 진단 결과를 드립니다.",
            },
            {
              title: "KCGS 24개 지표 완전 대응",
              body: "환경 8·사회 8·지배구조 8, 지표별 판정 근거와 만점기준 대비 갭을 명확히 보여줍니다.",
            },
            {
              title: "등급효과×난이도 우선순위",
              body: "Quick Win부터 인증·시스템 구축까지, 개선과제를 3단계 로드맵으로 관리하세요.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="text-base font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-subtext">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 요금제 */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-6 text-center text-2xl font-bold">요금제</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-6">
            <h3 className="font-bold">Free</h3>
            <p className="mt-1 text-2xl font-extrabold">0원</p>
            <p className="mt-2 text-sm text-subtext">진단 1회 체험</p>
          </div>
          <div className="card p-6">
            <h3 className="font-bold">Basic</h3>
            <p className="mt-1 text-2xl font-extrabold">
              월 30만 원
            </p>
            <p className="mt-2 text-sm text-subtext">연 2회 진단</p>
          </div>
          <div className="card border-pine p-6">
            <h3 className="font-bold text-pine">Pro</h3>
            <p className="mt-1 text-2xl font-extrabold">
              월 50만 원
            </p>
            <p className="mt-2 text-sm text-subtext">무제한 진단 + 개선과제 관리</p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-line bg-surface py-8">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-sm font-bold text-pine-dk">GRADE UP</p>
          <Disclaimer className="mt-2" />
        </div>
      </footer>
    </div>
  );
}
