import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "오사카 메트로 투어의 개인정보처리방침입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <h1 className="text-3xl font-black text-slate-900 mb-8">개인정보처리방침</h1>
      <p className="text-sm text-slate-400 mb-10">시행일: 2025년 5월 1일 | 최종 수정: 2025년 5월 1일</p>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-8">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. 개인정보의 처리 목적</h2>
          <p>
            오사카 메트로 투어(이하 &quot;사이트&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는
            별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>웹사이트 이용 통계 분석 및 서비스 개선</li>
            <li>맞춤형 콘텐츠 및 광고 제공</li>
            <li>사용자 문의 응대 및 고객 지원</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. 수집하는 개인정보 항목</h2>
          <p>사이트는 회원 가입 없이 이용 가능하며, 다음과 같은 정보가 자동으로 수집될 수 있습니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>접속 IP 주소, 브라우저 종류 및 버전, 운영체제 정보</li>
            <li>방문 일시, 서비스 이용 기록, 페이지 조회 기록</li>
            <li>쿠키(Cookie) 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            자동 수집되는 개인정보는 수집 목적 달성 시까지 보유하며, 관련 법령에 따른 보존 의무가 있는 경우 해당 기간 동안 보관합니다.
            방문 기록(로그 데이터)은 통계 분석 목적으로 최대 1년간 보관 후 파기합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. 개인정보의 제3자 제공</h2>
          <p>
            사이트는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. 쿠키(Cookie)의 사용</h2>
          <p>사이트는 이용자에게 최적화된 정보를 제공하기 위해 쿠키를 사용합니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>쿠키의 사용 목적:</strong> 이용자의 접속 빈도, 방문 시간 등을 파악하여 맞춤 서비스 및 광고 제공</li>
            <li><strong>쿠키의 설치·운영 및 거부:</strong> 웹 브라우저의 옵션 설정을 통해 쿠키 허용, 차단 등의 설정을 할 수 있습니다.
              다만, 쿠키 설정을 거부할 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. 광고 서비스</h2>
          <p>
            사이트는 Google AdSense를 포함한 제3자 광고 서비스를 이용하고 있으며, 이러한 광고 서비스 제공업체가
            쿠키를 사용하여 이용자의 관심사에 기반한 광고를 게재할 수 있습니다. 이용자는 Google 광고 설정 페이지
            (ads.google.com)에서 개인 맞춤 광고를 비활성화할 수 있습니다.
          </p>
          <p className="mt-2">
            또한, 사이트는 아고다(Agoda), 호텔스닷컴(Hotels.com), 클룩(Klook) 등의 어필리에이트(제휴) 파트너와
            협력하고 있으며, 제휴 링크를 통한 예약 시 사이트 운영자에게 소정의 수수료가 지급될 수 있습니다.
            이는 이용자에게 추가 비용을 발생시키지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. 개인정보 보호책임자</h2>
          <p>
            사이트의 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 불만 처리 및 피해 구제 등을 위하여
            아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mt-2 text-sm">
            <p><strong>담당자:</strong> 오사카 메트로 투어 운영팀</p>
            <p><strong>이메일:</strong> geoffreylim330@gmail.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. 개인정보처리방침의 변경</h2>
          <p>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는
            변경 사항의 시행 7일 전부터 사이트를 통하여 공지할 것입니다.
          </p>
        </section>
      </div>
    </div>
  );
}
