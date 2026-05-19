import { calculateSaju } from '../../public/saju_engine.js';

// Help map date to Ganji Stem directly
function getDayStemForDate(birthDayStem, targetDate) {
  const t1 = new Date(1980, 0, 1).getTime();
  const t2 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const diffDays = Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
  
  const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const stemIdx = (9 + diffDays) % 10;
  const targetStemName = stems[stemIdx >= 0 ? stemIdx : stemIdx + 10];
  
  const STEM_OBJECTS = {
    '갑': { name: '갑', hanja: '甲', element: '목', polarity: '+' },
    '을': { name: '을', hanja: '乙', element: '목', polarity: '-' },
    '병': { name: '병', hanja: '丙', element: '화', polarity: '+' },
    '정': { name: '정', hanja: '丁', element: '화', polarity: '-' },
    '무': { name: '무', hanja: '戊', element: '토', polarity: '+' },
    '기': { name: '기', hanja: '己', element: '토', polarity: '-' },
    '경': { name: '경', hanja: '庚', element: '금', polarity: '+' },
    '신': { name: '신', hanja: '辛', element: '금', polarity: '-' },
    '임': { name: '임', hanja: '壬', element: '수', polarity: '+' },
    '계': { name: '계', hanja: '癸', element: '수', polarity: '-' }
  };
  
  return STEM_OBJECTS[targetStemName];
}

// Map Month to Month Stem
function getMonthStemForDate(targetDate) {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  
  const yearStemIdx = (year - 4) % 10;
  const yearStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const yearStemName = yearStems[yearStemIdx >= 0 ? yearStemIdx : yearStemIdx + 10];
  
  let monthStartStemIdx = 0;
  if (yearStemName === '갑' || yearStemName === '기') monthStartStemIdx = 2; // 丙寅
  else if (yearStemName === '을' || yearStemName === '경') monthStartStemIdx = 4; // 戊寅
  else if (yearStemName === '병' || yearStemName === '신') monthStartStemIdx = 6; // 庚寅
  else if (yearStemName === '정' || yearStemName === '임') monthStartStemIdx = 8; // 壬寅
  else if (yearStemName === '무' || yearStemName === '계') monthStartStemIdx = 0; // 甲寅
  
  const monthIdx = (month - 2 + 12) % 12; 
  const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const targetStemName = stems[(monthStartStemIdx + monthIdx) % 10];
  
  const STEM_OBJECTS = {
    '갑': { name: '갑', hanja: '甲', element: '목', polarity: '+' },
    '을': { name: '을', hanja: '乙', element: '목', polarity: '-' },
    '병': { name: '병', hanja: '丙', element: '화', polarity: '+' },
    '정': { name: '정', hanja: '丁', element: '화', polarity: '-' },
    '무': { name: '무', hanja: '戊', element: '토', polarity: '+' },
    '기': { name: '기', hanja: '己', element: '토', polarity: '-' },
    '경': { name: '경', hanja: '庚', element: '금', polarity: '+' },
    '신': { name: '신', hanja: '辛', element: '금', polarity: '-' },
    '임': { name: '임', hanja: '壬', element: '수', polarity: '+' },
    '계': { name: '계', hanja: '癸', element: '수', polarity: '-' }
  };
  
  return STEM_OBJECTS[targetStemName];
}

function calculateSipsinRelation(dayStemObj, targetStemObj) {
  const rel = {
    '목': { '목': '비겁', '화': '식상', '토': '재성', '금': '관성', '수': '인성' },
    '화': { '목': '인성', '화': '비겁', '토': '식상', '금': '재성', '수': '관성' },
    '토': { '목': '관성', '화': '인성', '토': '비겁', '금': '식상', '수': '재성' },
    '금': { '목': '재성', '화': '관성', '토': '인성', '금': '비겁', '수': '식상' },
    '수': { '목': '식상', '화': '재성', '토': '관성', '금': '인성', '수': '비겁' }
  };
  
  const category = rel[dayStemObj.element][targetStemObj.element];
  const samePolarity = dayStemObj.polarity === targetStemObj.polarity;
  
  if (category === '비겁') return samePolarity ? '비견' : '겁재';
  if (category === '식상') return samePolarity ? '식신' : '상관';
  if (category === '재성') return samePolarity ? '편재' : '정재';
  if (category === '관성') return samePolarity ? '편관' : '정관';
  if (category === '인성') return samePolarity ? '편인' : '정인';
  return '비견';
}

async function getGeminiFortune(saju, targetDate, todayStemObj, monthStemObj, relationDaily, apiKey) {
  const prompt = `
당신은 지혜롭고 통찰력 있는 최고의 명리학자입니다.
다음은 사용자의 사주 원국과 대상 날짜의 정보입니다. 이 정보를 바탕으로 일일, 주간, 월간 운세를 분석해주세요. 각 운세는 고정된 해석이 아니라 사용자의 사주 특성과 시운(時運)의 상호작용을 깊이 있게 풀어낸 동적인 해석이어야 합니다.

[사용자 정보]
- 이름/성별: ${saju.name} / ${saju.gender}
- 사주 원국:
  년주: ${saju.pillars.year.stem.hanja}${saju.pillars.year.branch.hanja} (${saju.pillars.year.sipsinStem} / ${saju.pillars.year.sipsinBranch})
  월주: ${saju.pillars.month.stem.hanja}${saju.pillars.month.branch.hanja} (${saju.pillars.month.sipsinStem} / ${saju.pillars.month.sipsinBranch})
  일주: ${saju.pillars.day.stem.hanja}${saju.pillars.day.branch.hanja} (일간 - 나 자신)
  시주: ${saju.pillars.hour.stem.hanja}${saju.pillars.hour.branch.hanja} (${saju.pillars.hour.sipsinStem} / ${saju.pillars.hour.sipsinBranch})
- 현재 대운: ${saju.daeunNumber}대운

[시운 정보 (Target Date: ${targetDate.toISOString().split('T')[0]})]
- 오늘의 일진(천간): ${todayStemObj.hanja} (${relationDaily})
- 이 달의 기운(천간): ${monthStemObj.hanja}

[요청 사항]
- 일일 운세: 오늘 하루의 기운(${todayStemObj.name})과 일간(${saju.pillars.day.stem.name})의 관계를 중심으로 디테일하게 풀어주세요.
- 주간 운세: 이번 주 전체를 관통하는 흐름과 조언을 써주세요 (일일 운세와 겹치지 않게 더 넓은 시야에서 해석).
- 월간 운세: 이번 달의 기운(${monthStemObj.name})을 중심으로 한 달간의 큰 흐름을 분석해주세요.

아래 JSON 형식에 맞추어 마크다운이나 기타 텍스트 없이 오직 유효한 JSON 문자열만 반환하세요.
{
  "daily": {
    "relation": "오늘의 주요 십신 (예: 정인)",
    "title": "오늘 운세 제목 (예: 귀인의 도움으로 문서를 쥐는 날)",
    "content": {
      "general": "총평 상세 내용 (3-4문장)",
      "wealth": "재물운 상세 내용 (2문장)",
      "love": "애정운/대인관계 상세 내용 (2문장)",
      "health": "건강운 상세 내용 (2문장)"
    },
    "scores": { "wealth": 1~5 숫자, "love": 1~5 숫자, "health": 1~5 숫자 }
  },
  "weekly": {
    "relation": "이번 주 주요 흐름 (예: 식상의 발산)",
    "title": "주간 운세 제목",
    "content": {
      "general": "주간 총평",
      "wealth": "주간 재물운",
      "love": "주간 애정운",
      "health": "주간 건강운"
    },
    "scores": { "wealth": 1~5, "love": 1~5, "health": 1~5 }
  },
  "monthly": {
    "relation": "이번 달 주요 십신",
    "title": "월간 운세 제목",
    "content": {
      "general": "월간 총평",
      "wealth": "월간 재물운",
      "love": "월간 애정운",
      "health": "월간 건강운"
    },
    "scores": { "wealth": 1~5, "love": 1~5, "health": 1~5 }
  }
}
`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      })
    });
    
    if (!res.ok) {
      let errorMsg = res.statusText;
      try {
        const errorData = await res.json();
        if (errorData && errorData.error && errorData.error.message) {
          errorMsg = errorData.error.message;
        }
      } catch (e) {
        // Ignore json parse error for error body
      }
      throw new Error(`Gemini API error: ${errorMsg}`);
    }
    
    const data = await res.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("AI Generation Error:", err);
    return { error: err.message || err.toString() };
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    // 1. Fetch User Profile
    const { results } = await env.DB.prepare(
      "SELECT name, birth_date, birth_time, calendar_type, gender FROM user_profile LIMIT 1"
    ).all();
    
    if (results.length === 0) {
      return new Response(JSON.stringify({ profile_required: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const profile = results[0];
    
    // 2. Calculate Saju Chart
    const saju = calculateSaju(profile);
    saju.name = profile.name;
    saju.gender = profile.gender;
    const dayStemObj = saju.pillars.day.stem;
    
    // Get requested date
    const url = new URL(request.url);
    let dateStr = url.searchParams.get("date");
    let targetDate = new Date();
    
    if (dateStr) {
      const parts = dateStr.split('-');
      targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    
    // 3. Generate Fortunes
    const todayStemObj = getDayStemForDate(dayStemObj, targetDate);
    const relationDaily = calculateSipsinRelation(dayStemObj, todayStemObj);
    const monthStemObj = getMonthStemForDate(targetDate);
    
    let aiFortune = null;
    const apiKey = request.headers.get('X-Gemini-Key') || env.GEMINI_API_KEY;
    if (apiKey) {
      aiFortune = await getGeminiFortune(saju, targetDate, todayStemObj, monthStemObj, relationDaily, apiKey);
    }
    
    // If AI failed or not configured, provide a minimal fallback (or the old static logic, simplified here)
    if (!aiFortune || aiFortune.error) {
      const errMsg = aiFortune ? aiFortune.error : "API 키가 설정되지 않았습니다.";
      const fallbackContent = {
        general: "명리학 API 오류: " + errMsg,
        wealth: "일시적 지연",
        love: "일시적 지연",
        health: "일시적 지연"
      };
      aiFortune = {
        daily: { relation: relationDaily, title: "일일 운세 요약", content: fallbackContent, scores: { wealth: 3, love: 3, health: 3 } },
        weekly: { relation: relationDaily, title: "주간 운세 요약", content: fallbackContent, scores: { wealth: 3, love: 3, health: 3 } },
        monthly: { relation: "월간 기운", title: "월간 운세 요약", content: fallbackContent, scores: { wealth: 3, love: 3, health: 3 } }
      };
    }
    
    return new Response(JSON.stringify({
      profile,
      saju,
      daily: aiFortune.daily,
      weekly: aiFortune.weekly,
      monthly: aiFortune.monthly
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
