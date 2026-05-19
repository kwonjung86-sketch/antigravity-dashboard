// 10 Stems (천간)
const STEMS = [
  { name: '갑', hanja: '甲', element: '목', polarity: '+', color: '#3b82f6' }, // Blue
  { name: '을', hanja: '乙', element: '목', polarity: '-', color: '#60a5fa' }, // Light Blue
  { name: '병', hanja: '丙', element: '화', polarity: '+', color: '#ef4444' }, // Red
  { name: '정', hanja: '정', element: '화', polarity: '-', color: '#f87171' }, // Light Red
  { name: '무', hanja: '戊', element: '토', polarity: '+', color: '#eab308' }, // Yellow
  { name: '기', hanja: '기', element: '토', polarity: '-', color: '#fde047' }, // Light Yellow
  { name: '경', hanja: '庚', element: '금', polarity: '+', color: '#ffffff' }, // White
  { name: '신', hanja: '신', element: '금', polarity: '-', color: '#e2e8f0' }, // Off White
  { name: '임', hanja: '임', element: '수', polarity: '+', color: '#1e293b' }, // Dark Grey
  { name: '계', hanja: '계', element: '수', polarity: '-', color: '#475569' }  // Grey
];

// 12 Branches (지지)
const BRANCHES = [
  { name: '자', hanja: '子', element: '수', animal: '쥐', color: '#1e293b' },
  { name: '축', hanja: '축', element: '토', animal: '소', color: '#fde047' },
  { name: '인', hanja: '인', element: '목', animal: '호랑이', color: '#3b82f6' },
  { name: '묘', hanja: '묘', element: '목', animal: '토끼', color: '#60a5fa' },
  { name: '진', hanja: '진', element: '토', animal: '용', color: '#eab308' },
  { name: '사', hanja: '사', element: '화', animal: '뱀', color: '#ef4444' },
  { name: '오', hanja: '오', element: '화', animal: '말', color: '#f87171' },
  { name: '미', hanja: '미', element: '토', animal: '양', color: '#fde047' },
  { name: '신', hanja: '신', element: '금', animal: '원숭이', color: '#ffffff' },
  { name: '유', hanja: '유', element: '금', animal: '닭', color: '#e2e8f0' },
  { name: '술', hanja: '술', element: '토', animal: '개', color: '#eab308' },
  { name: '해', hanja: '해', element: '수', animal: '돼지', color: '#1e293b' }
];

// Jigangan (지장간) mapping
const JIGANGAN = {
  '子': '임(壬) 계(癸)',
  '축': '계(癸) 신(辛) 기(己)',
  '인': '무(戊) 병(丙) 갑(甲)',
  '묘': '갑(甲) 을(乙)',
  '진': '을(乙) 계(癸) 무(戊)',
  '사': '무(戊) 경(庚) 병(丙)',
  '오': '병(丙) 기(己) 정(丁)',
  '미': '정(丁) 을(乙) 기(己)',
  '신': '무(戊) 임(壬) 경(庚)',
  '유': '경(庚) 신(辛)',
  '술': '신(辛) 정(丁) 무(戊)',
  '해': '무(戊) 갑(甲) 임(壬)'
};

// 12 Unseong mapping cycles for each Day Stem (10 Stems)
// Order of branches: 子(0), 丑(1), 寅(2), 卯(3), 辰(4), 巳(5), 午(6), 未(7), 申(8), 酉(9), 戌(10), 亥(11)
// 12 Unseong: 장생, 목욕, 관대, 건록, 제왕, 쇠, 병, 사, 묘, 절, 태, 양
const UNSEONG_NAMES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];

const UNSEONG_CYCLES = {
  '갑': [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Gap (Yang Wood): Starts at 해(11), forward
  '을': [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7], // Eul (Yin Wood): Starts at 오(6), backward
  '병': [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1], // Byeong (Yang Fire): Starts at 인(2), forward
  '정': [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10], // Jeong (Yin Fire): Starts at 유(9), backward
  '무': [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1], // Mu (Yang Earth): Starts at 인(2), forward
  '기': [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10], // Gi (Yin Earth): Starts at 유(9), backward
  '경': [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4], // Gyeong (Yang Metal): Starts at 사(5), forward
  '신': [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1], // Shin (Yin Metal): Starts at 자(0), backward
  '임': [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7], // Im (Yang Water): Starts at 신(8), forward
  '계': [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4]  // Gye (Yin Water): Starts at 묘(3), backward
};

// Sipsin (십성) Calculator based on Day Stem and Target Stem
function getSipsin(dayStem, targetStem) {
  if (dayStem.name === targetStem.name) return '비견';
  
  const rel = {
    '목': { '목': '비겁', '화': '식상', '토': '재성', '금': '관성', '수': '인성' },
    '화': { '목': '인성', '화': '비겁', '토': '식상', '금': '재성', '수': '관성' },
    '토': { '목': '관성', '화': '인성', '토': '비겁', '금': '식상', '수': '재성' },
    '금': { '목': '재성', '화': '관성', '토': '인성', '금': '비겁', '수': '식상' },
    '수': { '목': '식상', '화': '재성', '토': '관성', '금': '인성', '수': '비겁' }
  };
  
  const category = rel[dayStem.element][targetStem.element];
  const samePolarity = dayStem.polarity === targetStem.polarity;
  
  if (category === '비겁') return samePolarity ? '비견' : '겁재';
  if (category === '식상') return samePolarity ? '식신' : '상관';
  if (category === '재성') return samePolarity ? '편재' : '정재';
  if (category === '관성') return samePolarity ? '편관' : '정관';
  if (category === '인성') return samePolarity ? '편인' : '정인';
  
  return '';
}

// Convert Branch element to Stem element for Sipsin calculation
function getSipsinForBranch(dayStem, targetBranch) {
  // Map branch element to a mock stem of same polarity and element
  const stemRepresentation = STEMS.find(s => s.element === targetBranch.element && s.polarity === (targetBranch.name === '자' || targetBranch.name === '해' || targetBranch.name === '인' || targetBranch.name === '묘' || targetBranch.name === '사' || targetBranch.name === '오' || targetBranch.name === '신' || targetBranch.name === '유' ? '+' : '-'));
  return getSipsin(dayStem, stemRepresentation || STEMS[0]);
}

// Base JDs of 12 Monthly entry terms (절기) in 2000
const BASE_JD0 = [
  2451549.378, // Sohan (소한, Month 12 start, 丑)
  2451579.028, // Ipchun (입춘, Month 1 start, 寅)
  2451609.042, // Gyeongchip (경칩, Month 2 start, 卯)
  2451639.219, // Cheongmyeong (청명, Month 3 start, 辰)
  2451669.771, // Ipha (입하, Month 4 start, 巳)
  2451701.111, // Mangjong (망종, Month 5 start, 午)
  2451732.476, // Soseo (소서, Month 6 start, 未)
  2451763.882, // Ipchu (입추, Month 7 start, 申)
  2451794.510, // Baengno (백로, Month 8 start, 酉)
  2451825.153, // Hanro (한로, Month 9 start, 戌)
  2451855.278, // Ipdong (입동, Month 10 start, 亥)
  2451885.003  // Daeseol (대설, Month 11 start, 子)
];

// Helper to calculate JD for a specific Solar Term in a year
function getSolarTermJD(year, index) {
  const yOffset = (year - 2000) / 1000;
  return BASE_JD0[index] + 365242.1374 * yOffset;
}

// Calculate days between 1980-01-01 and the target date
function getDaysSince1980(year, month, day) {
  const t1 = new Date(1980, 0, 1).getTime();
  const t2 = new Date(year, month - 1, day).getTime();
  return Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
}

// Saju Calculation Engine Main Entry
function calculateSaju(profile) {
  // profile: { name, birthDate/birth_date: 'YYYY-MM-DD', birthTime/birth_time: 'HH:MM', gender: 'male'|'female', calendarType/calendar_type: 'solar' }
  const rawBirthDate = profile.birthDate || profile.birth_date;
  const rawBirthTime = profile.birthTime || profile.birth_time;
  
  if (!rawBirthDate || !rawBirthTime) {
    throw new Error('birth_date and birth_time are required profile fields.');
  }

  const parts = rawBirthDate.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  
  const timeParts = rawBirthTime.split(':');
  let hour = parseInt(timeParts[0]);
  let minute = parseInt(timeParts[1]);
  
  // Chuncheon Local Solar Time correction (-30 mins)
  let localHour = hour;
  let localMinute = minute - 30;
  if (localMinute < 0) {
    localHour -= 1;
    localMinute += 60;
  }
  if (localHour < 0) {
    localHour += 24;
  }
  
  // Calculate JD for the birth date at UTC (approx noon of KST)
  // Let's find Solar Term bounds for the birth year
  const terms = [];
  for (let i = 0; i < 12; i++) {
    const jdKST = getSolarTermJD(year, i);
    // Convert JD to Date
    const daysFrom2000 = jdKST - 2451545.0;
    const baseDate = new Date(2000, 0, 1, 12, 0, 0);
    const termDate = new Date(baseDate.getTime() + daysFrom2000 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000);
    terms.push({ index: i, date: termDate });
  }
  
  const birthDateTime = new Date(year, month - 1, day, hour, minute);
  
  // 1. Determine Saju Year and Month
  let sajuYear = year;
  let termIndex = -1; // Index in terms
  
  // Locate which term interval the birth falls into
  // We need to compare with Sohan (Jan) and Ipchun (Feb)
  const ipchunDate = terms[1].date; // Ipchun
  
  if (birthDateTime < ipchunDate) {
    sajuYear = year - 1;
  }
  
  // Locate month term
  // Let's get terms for sajuYear (might be different if year changed)
  const yearTerms = [];
  for (let i = 0; i < 12; i++) {
    const jdKST = getSolarTermJD(sajuYear === year ? year : sajuYear + 1, i);
    const daysFrom2000 = jdKST - 2451545.0;
    const baseDate = new Date(2000, 0, 1, 12, 0, 0);
    const termDate = new Date(baseDate.getTime() + daysFrom2000 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000);
    yearTerms.push({ index: i, date: termDate });
  }
  
  // Let's check intervals
  // 0: Sohan ~ Ipchun (Month 12, 丑)
  // 1: Ipchun ~ Gyeongchip (Month 1, 寅)
  // ...
  // 11: Daeseol ~ Sohan of next year (Month 11, 子)
  let sajuMonthIndex = 0; // 0 to 11 (corresponds to Month 1 to 12)
  let termPassed = null;
  let nextTerm = null;
  
  // If birth is before Ipchun of current year, it falls in Month 12 (Sohan ~ Ipchun) of previous year
  if (birthDateTime < ipchunDate) {
    sajuMonthIndex = 11; // 12th Month (丑)
    termPassed = terms[0].date; // Sohan of current calendar year (January)
    nextTerm = ipchunDate;
  } else {
    // Find which term was passed
    for (let i = 1; i < 12; i++) {
      const currentTerm = yearTerms[i].date;
      const nextTermObj = (i === 11) ? getSolarTermJD(sajuYear + 1, 0) : getSolarTermJD(sajuYear, i + 1);
      
      let nextTermDate;
      if (i === 11) {
        const daysFrom2000 = nextTermObj - 2451545.0;
        nextTermDate = new Date(new Date(2000, 0, 1, 12, 0, 0).getTime() + daysFrom2000 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000);
      } else {
        const daysFrom2000 = getSolarTermJD(sajuYear, i + 1) - 2451545.0;
        nextTermDate = new Date(new Date(2000, 0, 1, 12, 0, 0).getTime() + daysFrom2000 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000);
      }
      
      if (birthDateTime >= currentTerm && birthDateTime < nextTermDate) {
        sajuMonthIndex = i - 1; // Ipchun is index 1, but represents Month 1 (寅, index 0 in Branches)
        termPassed = currentTerm;
        nextTerm = nextTermDate;
        break;
      }
    }
  }
  
  // Year Pillar: Year Stem & Branch
  // 1984 is 甲子 (Stem index 0, Branch index 0)
  const yearStemIdx = (sajuYear - 4) % 10;
  const yearBranchIdx = (sajuYear - 4) % 12;
  const yearStem = STEMS[yearStemIdx >= 0 ? yearStemIdx : yearStemIdx + 10];
  const yearBranch = BRANCHES[yearBranchIdx >= 0 ? yearBranchIdx : yearBranchIdx + 12];
  
  // Month Pillar:
  // Month Branch: Month 1 is 寅(2), Month 2 is 卯(3), ..., Month 12 is 丑(1)
  const monthBranchIdx = (sajuMonthIndex + 2) % 12;
  const monthBranch = BRANCHES[monthBranchIdx];
  
  // Month Stem rule:
  // Day/Year Stem is 甲/己 -> Month 1 is 丙寅 (index 2)
  // Year Stem is 乙/庚 -> Month 1 is 戊寅 (index 4)
  // Year Stem is 丙/辛 -> Month 1 is 庚寅 (index 6)
  // Year Stem is 丁/壬 -> Month 1 is 壬寅 (index 8)
  // Year Stem is 戊/癸 -> Month 1 is 甲寅 (index 0)
  let monthStartStemIdx = 0;
  if (yearStem.name === '갑' || yearStem.name === '기') monthStartStemIdx = 2;
  else if (yearStem.name === '을' || yearStem.name === '경') monthStartStemIdx = 4;
  else if (yearStem.name === '병' || yearStem.name === '신') monthStartStemIdx = 6;
  else if (yearStem.name === '정' || yearStem.name === '임') monthStartStemIdx = 8;
  else if (yearStem.name === '무' || yearStem.name === '계') monthStartStemIdx = 0;
  
  const monthStemIdx = (monthStartStemIdx + sajuMonthIndex) % 10;
  const monthStem = STEMS[monthStemIdx];
  
  // 2. Day Pillar
  // Ref: 1980-01-01 is 癸酉 (index 9)
  const daysOffset = getDaysSince1980(year, month, day);
  const dayStemIdx = (9 + daysOffset) % 10;
  const dayBranchIdx = (9 + daysOffset) % 12;
  const dayStem = STEMS[dayStemIdx >= 0 ? dayStemIdx : dayStemIdx + 10];
  const dayBranch = BRANCHES[dayBranchIdx >= 0 ? dayBranchIdx : dayBranchIdx + 12];
  
  // 3. Hour Pillar
  // Hour Branches:
  // 子: 23:30 ~ 01:30 (KST) or local solar 23:00 ~ 01:00
  // 丑: 01:30 ~ 03:30
  // 寅: 03:30 ~ 05:30
  // 卯: 05:30 ~ 07:30
  // 辰: 07:30 ~ 09:30
  // 巳: 09:30 ~ 11:30 (Local solar: 09:00 ~ 11:00)
  // 午: 11:30 ~ 13:30
  // 未: 13:30 ~ 15:30
  // 申: 15:30 ~ 17:30
  // 酉: 17:30 ~ 19:30
  // 戌: 19:30 ~ 21:30
  // 亥: 21:30 ~ 23:30
  
  // Check branch based on corrected local hour
  let hourBranchIdx = 0;
  if (localHour >= 23 || localHour < 1) hourBranchIdx = 0; // 子
  else if (localHour >= 1 && localHour < 3) hourBranchIdx = 1; // 丑
  else if (localHour >= 3 && localHour < 5) hourBranchIdx = 2; // 寅
  else if (localHour >= 5 && localHour < 7) hourBranchIdx = 3; // 卯
  else if (localHour >= 7 && localHour < 9) hourBranchIdx = 4; // 辰
  else if (localHour >= 9 && localHour < 11) hourBranchIdx = 5; // 巳
  else if (localHour >= 11 && localHour < 13) hourBranchIdx = 6; // 午
  else if (localHour >= 13 && localHour < 15) hourBranchIdx = 7; // 未
  else if (localHour >= 15 && localHour < 17) hourBranchIdx = 8; // 申
  else if (localHour >= 17 && localHour < 19) hourBranchIdx = 9; // 酉
  else if (localHour >= 19 && localHour < 21) hourBranchIdx = 10; // 戌
  else if (localHour >= 21 && localHour < 23) hourBranchIdx = 11; // 亥
  
  const hourBranch = BRANCHES[hourBranchIdx];
  
  // Hour Stem rule (시두법):
  // Day Stem is 甲/己 -> Hour 1 (子시) is 甲子
  // Day Stem is 乙/庚 -> Hour 1 (子시) is 丙子
  // Day Stem is 丙/辛 -> Hour 1 (子시) is 戊子
  // Day Stem is 丁/壬 -> Hour 1 (子시) is 庚子
  // Day Stem is 戊/癸 -> Hour 1 (子시) is 壬子
  let hourStartStemIdx = 0;
  if (dayStem.name === '갑' || dayStem.name === '기') hourStartStemIdx = 0;
  else if (dayStem.name === '을' || dayStem.name === '경') hourStartStemIdx = 2;
  else if (dayStem.name === '병' || dayStem.name === '신') hourStartStemIdx = 4;
  else if (dayStem.name === '정' || dayStem.name === '임') hourStartStemIdx = 6;
  else if (dayStem.name === '무' || dayStem.name === '계') hourStartStemIdx = 8;
  
  const hourStemIdx = (hourStartStemIdx + hourBranchIdx) % 10;
  const hourStem = STEMS[hourStemIdx];
  
  // 4. Daeun (대운) Calculation
  // Direction: Male && Yin Year Stem -> Backward, Female && Yin Year Stem -> Forward
  const isYangYear = ['갑', '병', '무', '경', '임'].includes(yearStem.name);
  const isMale = profile.gender === 'male';
  const isForwardDaeun = (isMale && isYangYear) || (!isMale && !isYangYear);
  
  // Daeun Number (대운수): Days from birth to entry/previous term divided by 3
  let daysDiff = 0;
  if (isForwardDaeun) {
    // Days to NEXT term
    daysDiff = Math.abs((nextTerm.getTime() - birthDateTime.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // Days to PREVIOUS term
    daysDiff = Math.abs((birthDateTime.getTime() - termPassed.getTime()) / (1000 * 60 * 60 * 24));
  }
  const daeunNumber = Math.max(1, Math.round(daysDiff / 3));
  
  // Daeun Pillars: Count forward or backward from Month Pillar (monthStem, monthBranch)
  const daeunList = [];
  let currentStemIdx = STEMS.findIndex(s => s.name === monthStem.name);
  let currentBranchIdx = BRANCHES.findIndex(b => b.name === monthBranch.name);
  
  for (let i = 1; i <= 10; i++) {
    if (isForwardDaeun) {
      currentStemIdx = (currentStemIdx + 1) % 10;
      currentBranchIdx = (currentBranchIdx + 1) % 12;
    } else {
      currentStemIdx = (currentStemIdx - 1 + 10) % 10;
      currentBranchIdx = (currentBranchIdx - 1 + 12) % 12;
    }
    const daeunAge = daeunNumber + (i - 1) * 10;
    daeunList.push({
      age: daeunAge,
      stem: STEMS[currentStemIdx],
      branch: BRANCHES[currentBranchIdx],
      sipsinStem: getSipsin(dayStem, STEMS[currentStemIdx]),
      sipsinBranch: getSipsinForBranch(dayStem, BRANCHES[currentBranchIdx])
    });
  }
  
  // 5. Build Saju Chart Output
  return {
    profile,
    pillars: {
      year: { stem: yearStem, branch: yearBranch, sipsinStem: getSipsin(dayStem, yearStem), sipsinBranch: getSipsinForBranch(dayStem, yearBranch), jigangan: JIGANGAN[yearBranch.name], unseong: UNSEONG_NAMES[UNSEONG_CYCLES[dayStem.name][yearBranchIdx]] },
      month: { stem: monthStem, branch: monthBranch, sipsinStem: getSipsin(dayStem, monthStem), sipsinBranch: getSipsinForBranch(dayStem, monthBranch), jigangan: JIGANGAN[monthBranch.name], unseong: UNSEONG_NAMES[UNSEONG_CYCLES[dayStem.name][monthBranchIdx]] },
      day: { stem: dayStem, branch: dayBranch, sipsinStem: '본인', sipsinBranch: getSipsinForBranch(dayStem, dayBranch), jigangan: JIGANGAN[dayBranch.name], unseong: UNSEONG_NAMES[UNSEONG_CYCLES[dayStem.name][dayBranchIdx]] },
      hour: { stem: hourStem, branch: hourBranch, sipsinStem: getSipsin(dayStem, hourStem), sipsinBranch: getSipsinForBranch(dayStem, hourBranch), jigangan: JIGANGAN[hourBranch.name], unseong: UNSEONG_NAMES[UNSEONG_CYCLES[dayStem.name][hourBranchIdx]] }
    },
    daeunNumber,
    isForwardDaeun,
    daeunList
  };
}

// Export for browser or commonjs
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateSaju };
} else {
  window.calculateSaju = calculateSaju;
}
