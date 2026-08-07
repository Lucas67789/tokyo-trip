import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "오사카 메트로 투어의 서비스 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <h1 className="text-3xl font-black text-slate-900 mb-8">이용약관</h1>
      <p className="text-sm text-slate-400 mb-10">시행일: 2025년 5월 1일 | 최종 수정: 2025년 5월 1일</p>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-8">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">제1조 (목적)</h2>
          <p>
            이 약관은 오사카 메트로 투어(이하 &quot;사이트&quot;)가 제공하는 인터넷 관련 서비스(이하 &quot;서비스&quot;)의
            이용 조건 및 절차, 사이트와 이용자의 권리·의무 및 책임사항 등을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">제2조 (서비스의 내용)</h2>
          <p>사이트는 다음과 같은 서비스를 제공합니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>오사카 지하철 노선도 및 경로 안내 서비스</li>
            <li>오사카 여행 관련 정보(호텔, 교통 패스, 관광지 등) 제공</li>
            <li>여행 관련 제휴 서비스 할인코드 안내</li>
            <li>고화질 지하철 노선도 PDF 다운로드</li>
            <li>기타 오사카 여행에 유용한 콘텐츠 제공</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">제3조 (이용자의 의무)</h2>
          <p>이용자는 서비스 이용 시 다음 각 호의 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>타인의 정보를 도용하는 행위</li>
            <li>사이트의 정보를 변경하거나 사이트에 게시된 정보를 무단으로 상업적으로 이용하는 행위</li>
            <li>사이트의 운영을 방해하거나 안정적 운영을 저해하는 행위</li>
            <li>사이트가 정한 정보 이외의 정보(컴퓨터 프로그램 등)를 송신하거나 게시하는 행위</li>
            <li>사이트의 직원이나 운영자를 가장하는 행위</li>
            <li>기타 관계 법령에 위배되는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">제4조 (서비스의 중단)</h2>
          <p>
            사이트는 시스템 점검, 교체 및 고장, 통신 두절 등의 사유가 발생한 경우에는 서비스의 제공을
            일시적으로 중단할 수 있으며, 새로운 서비스로의 교체 등 사이트가 적절하다고 판단하는 사유에
            의하여 현재 제공되는 서비스를 완전히 중단할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">제5조 (저작권)</h2>
          <p>
            사이트에 게시된 모든 콘텐츠(텍스트, 이미지, 디자인, 소스코드 등)의 저작권은 사이트 운영자에게 있습니다.
            이용자는 사이트를 이용함으로써 얻은 정보를 사이트의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 등
            기타 방법에 의하여 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">제6조 (제휴 링크 및 광고)</h2>
          <p>
            사이트에는 아고다(Agoda), 호텔스닷컴(Hotels.com), 클룩(Klook) 등 외부 서비스로 연결되는
            제휴(어필리에이트) 링크가 포함되어 있습니다. 이용자가 해당 링크를 통해 외부 서비스에서
            상품을 구매하는 경우, 사이트 운영자에게 소정의 수수료가 지급될 수 있습니다.
            이는 이용자에게 추가 비용을 발생시키지 않습니다.
          </p>
          <p className="mt-2">
            사이트에는 Google AdSense 등 제3자 광고가 게재될 수 있으며, 광고의 내용에 대한 책임은 해당 광고주에게 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">제7조 (면책 조항)</h2>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>사이트에서 제공하는 경로 안내, 소요시간, 요금 등의 정보는 참고용이며, 실제와 다를 수 있습니다.
              최종 확인은 각 교통기관 공식 사이트를 통해 확인하시기 바랍니다.</li>
            <li>사이트에서 제공하는 호텔 가격 및 할인코드 정보는 수시로 변동될 수 있으며,
              사이트는 이로 인한 손해에 대해 책임을 지지 않습니다.</li>
            <li>외부 사이트(아고다, 호텔스닷컴, 클룩 등)에서 발생하는 거래에 대해 사이트는 중개자 역할만 하며,
              거래와 관련한 책임은 해당 외부 서비스와 이용자 간에 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">제8조 (약관의 변경)</h2>
          <p>
            사이트는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 약관이 변경되는 경우에는
            변경 사항을 시행일 7일 전부터 서비스 공지 사항에서 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">제9조 (문의)</h2>
          <p>본 약관과 관련한 문의 사항은 아래로 연락해 주시기 바랍니다.</p>
          <div className="bg-slate-50 rounded-xl p-4 mt-2 text-sm">
            <p><strong>담당자:</strong> 오사카 메트로 투어 운영팀</p>
            <p><strong>이메일:</strong> geoffreylim330@gmail.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
