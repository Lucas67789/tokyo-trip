import { login } from './actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E17] relative overflow-hidden">
      {/* Background Cyberpunk Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="bg-[#1A2235]/40 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl border border-white/5 w-full max-w-md mx-4 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,240,255,0.3)] rotate-3">
            <span className="text-white font-black text-2xl -rotate-3">T</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">도쿄 트립 관리자</h1>
          <p className="text-white/60 font-medium">승인된 계정으로만 접근이 가능합니다.</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-white/80 mb-1.5 ml-1" htmlFor="email">이메일 계정</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@tokyotrip.kr"
              required
              className="w-full border border-white/10 bg-[#0A0E17]/50 text-white rounded-xl px-4 py-3.5 focus:bg-[#0A0E17] focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-white/30 font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white/80 mb-1.5 ml-1" htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full border border-white/10 bg-[#0A0E17]/50 text-white rounded-xl px-4 py-3.5 focus:bg-[#0A0E17] focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-white/30 font-medium"
            />
          </div>
          <button
            formAction={login}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all active:scale-95 mt-8 flex items-center justify-center gap-2"
          >
            안전하게 로그인
          </button>
        </form>
      </div>
    </div>
  )
}
