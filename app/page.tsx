'use client';

import { useMemo, useState } from 'react';

type ViewMode = 'simple' | 'compare';
type BrewMethod = 'espresso' | 'capsule' | 'brewing' | 'bottle';

type Method = {
  id: string;
  name: string;
  description: string;
  unitCost: number;
  equipmentCost: number;
};

type SimpleAnswers = {
  beanBagPrice: number;
  beanBagWeight: number;
  doseGrams: number;
  capsulePackPrice: number;
  capsuleCount: number;
  capsulesPerCup: number;
  bottlePrice: number;
  bottleVolume: number;
  servingFromBottle: number;
  bottleCaffeineMg: number;
  extractedMl: number;
  addedWaterMl: number;
  cupsPerDay: number;
  daysPerYear: number;
  equipmentCost: number;
  equipmentYears: number;
  annualSuppliesCost: number;
};

type NumberQuestion = {
  id: keyof SimpleAnswers;
  eyebrow: string;
  title: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  suggestions?: number[];
};

const METHOD_META: Record<BrewMethod, { name: string; tag: string; description: string }> = {
  espresso: {
    name: '에스프레소 머신',
    tag: 'ESPRESSO',
    description: '원두와 머신으로 샷을 직접 추출해요.',
  },
  capsule: {
    name: '캡슐머신',
    tag: 'CAPSULE',
    description: '캡슐 한 개 또는 여러 개로 추출해요.',
  },
  brewing: {
    name: '브루잉 · 드립',
    tag: 'BREWING',
    description: '원두를 물에 우려 필터로 내려 마셔요.',
  },
  bottle: {
    name: '병 · 페트 커피',
    tag: 'READY TO DRINK',
    description: '완제품을 사서 한 잔씩 나눠 마셔요.',
  },
};

const INITIAL_ANSWERS: SimpleAnswers = {
  beanBagPrice: 18000,
  beanBagWeight: 500,
  doseGrams: 20,
  capsulePackPrice: 10000,
  capsuleCount: 10,
  capsulesPerCup: 1,
  bottlePrice: 2000,
  bottleVolume: 500,
  servingFromBottle: 250,
  bottleCaffeineMg: 150,
  extractedMl: 40,
  addedWaterMl: 210,
  cupsPerDay: 2,
  daysPerYear: 365,
  equipmentCost: 300000,
  equipmentYears: 5,
  annualSuppliesCost: 30000,
};

const DEFAULT_METHODS: Method[] = [
  {
    id: 'bottle',
    name: '병커피',
    description: '500ml 1병 1,000원 → 250ml 기준 절반 사용',
    unitCost: 500,
    equipmentCost: 0,
  },
  {
    id: 'capsule',
    name: '캡슐머신',
    description: '캡슐 1개 30ml 추출 + 물 220ml',
    unitCost: 700,
    equipmentCost: 150000,
  },
  {
    id: 'espresso',
    name: '에스프레소 머신',
    description: '원두 20g → 60ml 추출 + 물 190ml',
    unitCost: 600,
    equipmentCost: 400000,
  },
  {
    id: 'brewing',
    name: '브루잉 484',
    description: '원두 20g → 160ml 추출 + 물 90ml',
    unitCost: 600,
    equipmentCost: 10000,
  },
];

const formatWon = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;
const formatNumber = (value: number, digits = 0) =>
  value.toLocaleString('ko-KR', { maximumFractionDigits: digits });

function getQuestions(method: BrewMethod): NumberQuestion[] {
  const beanQuestions: NumberQuestion[] = [
    {
      id: 'beanBagPrice',
      eyebrow: '원두 가격',
      title: '원두 한 봉지를 얼마에 구매하시나요?',
      description: '할인된 실제 구매가를 입력하면 계산이 더 정확해집니다.',
      unit: '원', min: 0, max: 1000000, step: 1000, suggestions: [12000, 18000, 25000],
    },
    {
      id: 'beanBagWeight',
      eyebrow: '원두 용량',
      title: '원두 한 봉지의 무게는 얼마인가요?',
      description: '제품 포장지에 적힌 총중량을 기준으로 입력해주세요.',
      unit: 'g', min: 1, max: 10000, step: 10, suggestions: [200, 500, 1000],
    },
    {
      id: 'doseGrams',
      eyebrow: '1회 사용량',
      title: '커피 한 잔에 원두를 몇 g 사용하시나요?',
      description: '분쇄 전 원두 무게를 기준으로 합니다.',
      unit: 'g', min: 1, max: 100, step: 1, suggestions: method === 'brewing' ? [15, 20, 25] : [16, 18, 20],
    },
  ];

  const purchaseQuestions: NumberQuestion[] = method === 'capsule'
    ? [
        {
          id: 'capsulePackPrice', eyebrow: '캡슐 가격', title: '캡슐 한 팩을 얼마에 구매하시나요?',
          description: '정가보다 실제 구매가를 입력하는 것이 좋습니다.', unit: '원', min: 0, max: 1000000, step: 1000,
          suggestions: [7000, 10000, 15000],
        },
        {
          id: 'capsuleCount', eyebrow: '팩 구성', title: '한 팩에 캡슐이 몇 개 들어 있나요?',
          description: '팩 전체 가격을 캡슐 수로 나누어 개당 가격을 계산합니다.', unit: '개', min: 1, max: 500, step: 1,
          suggestions: [10, 20, 40],
        },
        {
          id: 'capsulesPerCup', eyebrow: '1회 사용량', title: '한 잔을 만들 때 캡슐을 몇 개 사용하시나요?',
          description: '더블 샷처럼 두 개를 사용한다면 2를 선택하세요.', unit: '개', min: 1, max: 6, step: 1,
          suggestions: [1, 2, 3],
        },
      ]
    : method === 'bottle'
      ? [
          {
            id: 'bottlePrice', eyebrow: '제품 가격', title: '병 또는 페트 한 개의 가격은 얼마인가요?',
            description: '묶음 상품이라면 총가격을 개수로 나눈 가격을 입력해주세요.', unit: '원', min: 0, max: 100000, step: 100,
            suggestions: [1500, 2000, 3000],
          },
          {
            id: 'bottleVolume', eyebrow: '제품 용량', title: '제품 한 개의 총용량은 얼마인가요?',
            description: '라벨에 표시된 내용량을 입력해주세요.', unit: 'ml', min: 1, max: 5000, step: 10,
            suggestions: [275, 500, 1000],
          },
          {
            id: 'servingFromBottle', eyebrow: '1회 음용량', title: '한 번에 몇 ml를 마시나요?',
            description: '한 병을 나눠 마신다면 한 잔에 따르는 양만 입력해주세요.', unit: 'ml', min: 1, max: 5000, step: 10,
            suggestions: [200, 250, 500],
          },
          {
            id: 'bottleCaffeineMg', eyebrow: '카페인 표시량', title: '제품 한 병의 카페인은 몇 mg인가요?',
            description: '라벨의 카페인 함량을 입력하세요. 모르면 기본 추정값을 사용해도 됩니다.', unit: 'mg', min: 0, max: 1000, step: 5,
            suggestions: [100, 150, 200],
          },
        ]
      : beanQuestions;

  const volumeQuestions: NumberQuestion[] = method === 'bottle'
    ? []
    : [
        {
          id: 'extractedMl',
          eyebrow: method === 'brewing' ? '추출량' : '원액 추출량',
          title: method === 'brewing' ? '한 잔을 추출하면 커피가 몇 ml 나오나요?' : '한 잔에 커피 원액을 몇 ml 추출하시나요?',
          description: method === 'brewing'
            ? '드리퍼나 서버에 실제로 내려진 커피의 양을 입력해주세요.'
            : '샷 잔에 담기는 에스프레소 또는 캡슐 원액 기준입니다.',
          unit: 'ml', min: 1, max: 2000, step: 10,
          suggestions: method === 'brewing' ? [200, 250, 300] : [30, 40, 60],
        },
        {
          id: 'addedWaterMl', eyebrow: '가수량', title: '물 또는 녹은 얼음은 몇 ml 더하시나요?',
          description: '최종 음료량을 계산하기 위한 값입니다. 더하지 않는다면 0을 입력하세요.', unit: 'ml', min: 0, max: 2000, step: 10,
          suggestions: method === 'brewing' ? [0, 50, 100] : [150, 200, 250],
        },
      ];

  const equipmentQuestions: NumberQuestion[] = method === 'bottle'
    ? []
    : [
        {
          id: 'equipmentCost', eyebrow: '장비 비용', title: '커피 장비를 얼마에 구매하셨나요?',
          description: '머신, 그라인더, 드리퍼 등 핵심 장비의 합계입니다. 이미 비용을 제외하고 싶다면 0을 입력하세요.', unit: '원', min: 0, max: 20000000, step: 10000,
          suggestions: method === 'brewing' ? [50000, 100000, 200000] : [150000, 300000, 500000],
        },
        {
          id: 'equipmentYears', eyebrow: '사용 기간', title: '이 장비를 몇 년 사용할 계획인가요?',
          description: '장비 구입비를 사용 기간으로 나누어 1년 비용에 반영합니다.', unit: '년', min: 1, max: 30, step: 1,
          suggestions: [3, 5, 10],
        },
      ];

  return [
    ...purchaseQuestions,
    ...volumeQuestions,
    {
      id: 'cupsPerDay', eyebrow: '음용 습관', title: '하루에 커피를 몇 잔 마시나요?',
      description: '평균적인 하루를 떠올려 입력해주세요.', unit: '잔', min: 0.5, max: 20, step: 0.5,
      suggestions: [1, 2, 3],
    },
    {
      id: 'daysPerYear', eyebrow: '연간 빈도', title: '1년에 며칠 정도 커피를 마시나요?',
      description: '매일 마신다면 365일, 평일에만 마신다면 약 260일입니다.', unit: '일', min: 1, max: 366, step: 1,
      suggestions: [260, 300, 365],
    },
    ...equipmentQuestions,
    {
      id: 'annualSuppliesCost', eyebrow: '부대비용', title: '필터·세척제 등으로 1년에 얼마를 사용하나요?',
      description: method === 'bottle'
        ? '별도 비용이 없다면 0을 입력하세요.'
        : '필터, 세척제, 정수 필터와 예상 수리비 등을 합산합니다. 전기·물 사용료는 소액이라 선택적으로 포함하세요.',
      unit: '원', min: 0, max: 5000000, step: 5000,
      suggestions: method === 'bottle' ? [0, 10000, 30000] : [30000, 50000, 100000],
    },
  ];
}

function ModeSwitcher({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="mode-switch" aria-label="계산기 모드">
      <button className={mode === 'simple' ? 'active' : ''} onClick={() => onChange('simple')} aria-pressed={mode === 'simple'}>
        <span>간단 모드</span>
        <small>질문에 답하고 내 비용 계산</small>
      </button>
      <button className={mode === 'compare' ? 'active' : ''} onClick={() => onChange('compare')} aria-pressed={mode === 'compare'}>
        <span>비교 모드</span>
        <small>네 가지 방식을 한눈에 비교</small>
      </button>
    </div>
  );
}

function SimpleCalculator() {
  const [method, setMethod] = useState<BrewMethod | null>(null);
  const [answers, setAnswers] = useState<SimpleAnswers>(INITIAL_ANSWERS);
  const [step, setStep] = useState(0);

  const questions = useMemo(() => (method ? getQuestions(method) : []), [method]);
  const isResult = Boolean(method && step > questions.length);
  const currentQuestion = step > 0 && step <= questions.length ? questions[step - 1] : null;
  const totalSteps = questions.length + 1;
  const progress = isResult ? 100 : method ? (step / totalSteps) * 100 : 0;

  const result = useMemo(() => {
    if (!method) return null;

    let ingredientCostPerCup = 0;
    let caffeinePerCup = 0;
    let volumePerCup = answers.extractedMl + answers.addedWaterMl;
    let usageLabel = '';

    if (method === 'espresso' || method === 'brewing') {
      ingredientCostPerCup = (answers.beanBagPrice / Math.max(answers.beanBagWeight, 1)) * answers.doseGrams;
      caffeinePerCup = method === 'brewing' ? answers.doseGrams * 10.5 : 75 * (answers.doseGrams / 18);
      const bagsPerYear = (answers.doseGrams * answers.cupsPerDay * answers.daysPerYear) / Math.max(answers.beanBagWeight, 1);
      usageLabel = `원두 약 ${formatNumber(bagsPerYear, 1)}봉 / 년`;
    } else if (method === 'capsule') {
      ingredientCostPerCup = (answers.capsulePackPrice / Math.max(answers.capsuleCount, 1)) * answers.capsulesPerCup;
      caffeinePerCup = 75 * answers.capsulesPerCup;
      usageLabel = `캡슐 ${formatNumber(answers.capsulesPerCup * answers.cupsPerDay * answers.daysPerYear)}개 / 년`;
    } else {
      ingredientCostPerCup = (answers.bottlePrice / Math.max(answers.bottleVolume, 1)) * answers.servingFromBottle;
      caffeinePerCup = (answers.bottleCaffeineMg / Math.max(answers.bottleVolume, 1)) * answers.servingFromBottle;
      volumePerCup = answers.servingFromBottle;
      const bottlesPerYear = (answers.servingFromBottle * answers.cupsPerDay * answers.daysPerYear) / Math.max(answers.bottleVolume, 1);
      usageLabel = `제품 약 ${formatNumber(bottlesPerYear, 1)}병 / 년`;
    }

    const annualCups = answers.cupsPerDay * answers.daysPerYear;
    const annualIngredientCost = ingredientCostPerCup * annualCups;
    const annualEquipmentCost = method === 'bottle' ? 0 : answers.equipmentCost / Math.max(answers.equipmentYears, 1);
    const annualTotal = annualIngredientCost + annualEquipmentCost + answers.annualSuppliesCost;
    const effectiveCupCost = annualCups > 0 ? annualTotal / annualCups : 0;

    return {
      ingredientCostPerCup,
      caffeinePerCup,
      volumePerCup,
      usageLabel,
      annualCups,
      annualIngredientCost,
      annualEquipmentCost,
      annualTotal,
      effectiveCupCost,
      dailyCost: answers.daysPerYear > 0 ? annualTotal / answers.daysPerYear : 0,
      dailyVolume: volumePerCup * answers.cupsPerDay,
      dailyCaffeine: caffeinePerCup * answers.cupsPerDay,
    };
  }, [method, answers]);

  const updateAnswer = (id: keyof SimpleAnswers, value: number) => {
    setAnswers((current) => ({ ...current, [id]: Number.isFinite(value) ? value : 0 }));
  };

  const selectMethod = (nextMethod: BrewMethod) => {
    setMethod(nextMethod);
    setAnswers((current) => ({
      ...current,
      extractedMl: nextMethod === 'brewing' ? 250 : 40,
      addedWaterMl: nextMethod === 'brewing' ? 0 : 210,
      equipmentCost: nextMethod === 'brewing' ? 100000 : 300000,
      annualSuppliesCost: nextMethod === 'bottle' ? 0 : 30000,
    }));
  };

  const restart = () => {
    setMethod(null);
    setAnswers(INITIAL_ANSWERS);
    setStep(0);
  };

  const canContinue = Boolean(
    method &&
    (!currentQuestion || (
      answers[currentQuestion.id] >= currentQuestion.min &&
      answers[currentQuestion.id] <= currentQuestion.max
    ))
  );

  if (isResult && method && result) {
    return (
      <section className="simple-results" aria-live="polite">
        <div className="result-intro">
          <div>
            <p className="section-kicker">YOUR COFFEE REPORT</p>
            <h2>{METHOD_META[method].name}, 1년 계산이 끝났어요.</h2>
            <p>입력한 습관을 기준으로 재료비와 장비 연간 비용, 부대비용을 함께 반영했습니다.</p>
          </div>
          <span className="result-method-tag">{METHOD_META[method].tag}</span>
        </div>

        <div className="result-metrics">
          <article className="metric-card primary">
            <span>하루 커피 비용</span>
            <strong>{formatWon(result.dailyCost)}</strong>
            <small>커피를 마시는 날 기준</small>
          </article>
          <article className="metric-card">
            <span>하루 총 음용량</span>
            <strong>{formatNumber(result.dailyVolume)}ml</strong>
            <small>한 잔 {formatNumber(result.volumePerCup)}ml × {answers.cupsPerDay}잔</small>
          </article>
          <article className="metric-card">
            <span>1년 유지비</span>
            <strong>{formatWon(result.annualTotal)}</strong>
            <small>월평균 {formatWon(result.annualTotal / 12)}</small>
          </article>
          <article className="metric-card caffeine">
            <span>하루 카페인 추정량</span>
            <strong>{formatNumber(result.dailyCaffeine)}mg</strong>
            <small>한 잔 약 {formatNumber(result.caffeinePerCup)}mg</small>
          </article>
        </div>

        <div className="result-detail-grid">
          <article className="cost-breakdown">
            <div className="detail-heading">
              <div>
                <p className="section-kicker">COST BREAKDOWN</p>
                <h3>무엇에 얼마가 들까요?</h3>
              </div>
              <strong>{formatWon(result.effectiveCupCost)} <small>/ 실질 1잔</small></strong>
            </div>
            <dl>
              <div><dt>연간 재료비</dt><dd>{formatWon(result.annualIngredientCost)}</dd></div>
              <div><dt>장비 연간 환산</dt><dd>{formatWon(result.annualEquipmentCost)}</dd></div>
              <div><dt>필터·세척 등 부대비</dt><dd>{formatWon(answers.annualSuppliesCost)}</dd></div>
              <div className="total"><dt>연간 합계</dt><dd>{formatWon(result.annualTotal)}</dd></div>
            </dl>
          </article>

          <article className="habit-summary">
            <p className="section-kicker">YOUR ROUTINE</p>
            <h3>당신의 커피 루틴</h3>
            <ul>
              <li><span>연간 커피</span><strong>{formatNumber(result.annualCups)}잔</strong></li>
              <li><span>예상 사용량</span><strong>{result.usageLabel}</strong></li>
              <li><span>순수 재료비</span><strong>{formatWon(result.ingredientCostPerCup)} / 잔</strong></li>
              <li><span>연간 음용량</span><strong>{formatNumber((result.dailyVolume * answers.daysPerYear) / 1000, 1)}L</strong></li>
            </ul>
          </article>
        </div>

        <div className="result-note">
          <strong>계산 기준 안내</strong>
          <p>
            에스프레소는 원두 18g 1샷, 캡슐은 1개당 카페인 75mg, 브루잉은 원두 1g당 10.5mg으로 추정했습니다.
            원두와 제품, 추출 방식에 따라 실제 카페인과 추출량은 달라질 수 있습니다.
          </p>
        </div>

        <div className="result-actions">
          <button className="secondary-button" onClick={() => setStep(0)}>답변 수정하기</button>
          <button className="primary-button" onClick={restart}>처음부터 다시 계산</button>
        </div>
      </section>
    );
  }

  return (
    <section className="wizard-card">
      <div className="wizard-progress-wrap">
        <div className="wizard-progress-copy">
          <span>{method ? `질문 ${Math.min(step + 1, totalSteps)} / ${totalSteps}` : '질문 1 · 방식 선택'}</span>
          <strong>{Math.round(progress)}% 완료</strong>
        </div>
        <div className="wizard-progress" role="progressbar" aria-label="질문 진행률" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 ? (
        <fieldset className="method-question">
          <legend>
            <span className="question-number">Q1</span>
            <small>커피 방식</small>
            어느 방법으로 커피를 드십니까?
          </legend>
          <p>평소 가장 자주 사용하는 한 가지 방식을 골라주세요.</p>
          <div className="method-choice-grid">
            {(Object.keys(METHOD_META) as BrewMethod[]).map((id) => (
              <button key={id} type="button" className={method === id ? 'selected' : ''} onClick={() => selectMethod(id)} aria-pressed={method === id}>
                <span className="method-choice-tag">{METHOD_META[id].tag}</span>
                <strong>{METHOD_META[id].name}</strong>
                <small>{METHOD_META[id].description}</small>
                <i aria-hidden="true">{method === id ? '선택됨' : '선택'}</i>
              </button>
            ))}
          </div>
        </fieldset>
      ) : currentQuestion ? (
        <div className="number-question" key={currentQuestion.id}>
          <div className="question-title">
            <span className="question-number">Q{step + 1}</span>
            <small>{currentQuestion.eyebrow}</small>
            <h2>{currentQuestion.title}</h2>
            <p>{currentQuestion.description}</p>
          </div>
          <label className="wizard-input">
            <span className="sr-only">{currentQuestion.title}</span>
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
              value={answers[currentQuestion.id]}
              onChange={(event) => updateAnswer(currentQuestion.id, Number(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && canContinue) setStep((current) => current + 1);
              }}
            />
            <em>{currentQuestion.unit}</em>
          </label>
          {currentQuestion.suggestions ? (
            <div className="suggestion-row" aria-label="빠른 선택">
              {currentQuestion.suggestions.map((value) => (
                <button key={value} type="button" className={answers[currentQuestion.id] === value ? 'selected' : ''} onClick={() => updateAnswer(currentQuestion.id, value)}>
                  {formatNumber(value)}{currentQuestion.unit}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="wizard-actions">
        <button className="secondary-button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>이전</button>
        <button className="primary-button" onClick={() => setStep((current) => current + 1)} disabled={!canContinue}>
          {step === 0 ? '선택 완료' : step === questions.length ? '결과 확인' : '입력 완료'}
        </button>
      </div>
    </section>
  );
}

function ComparisonCalculator() {
  const [cupsPerDay, setCupsPerDay] = useState(3);
  const [daysPerYear, setDaysPerYear] = useState(365);
  const [methods, setMethods] = useState(DEFAULT_METHODS);
  const annualCups = cupsPerDay * daysPerYear;

  const results = useMemo(
    () => methods
      .map((method) => {
        const annualIngredientCost = method.unitCost * annualCups;
        const annualTotal = annualIngredientCost + method.equipmentCost;
        return { ...method, annualIngredientCost, annualTotal, effectiveCupCost: annualCups > 0 ? annualTotal / annualCups : 0 };
      })
      .sort((a, b) => a.annualTotal - b.annualTotal),
    [methods, annualCups]
  );

  const maxCost = Math.max(...results.map((result) => result.annualTotal), 1);
  const updateMethod = (id: string, field: 'unitCost' | 'equipmentCost', value: number) => {
    setMethods((current) => current.map((method) => method.id === id ? { ...method, [field]: Math.max(0, value || 0) } : method));
  };
  const reset = () => {
    setCupsPerDay(3);
    setDaysPerYear(365);
    setMethods(DEFAULT_METHODS);
  };

  return (
    <>
      <section className="control-card">
        <div className="section-heading">
          <div><p className="section-kicker">STEP 1</p><h2>내 커피 습관 설정</h2></div>
          <button className="ghost-button" onClick={reset}>기본값으로 초기화</button>
        </div>
        <div className="habit-grid">
          <label className="field"><span>하루 몇 잔?</span><div className="input-with-unit"><input type="number" min="0" max="20" step="1" value={cupsPerDay} onChange={(e) => setCupsPerDay(Math.max(0, Number(e.target.value)))} /><em>잔</em></div></label>
          <label className="field"><span>1년에 마시는 날</span><div className="input-with-unit"><input type="number" min="1" max="366" value={daysPerYear} onChange={(e) => setDaysPerYear(Math.min(366, Math.max(1, Number(e.target.value))))} /><em>일</em></div></label>
          <div className="summary-pill"><span>계산 기준</span><strong>250ml / 1잔</strong><small>얼음 제외 최종 음료량</small></div>
        </div>
      </section>

      <section className="control-card">
        <div className="section-heading"><div><p className="section-kicker">STEP 2</p><h2>방식별 가격 조정</h2></div><p className="muted">현재 가격에 맞게 숫자만 바꾸면 결과가 즉시 갱신됩니다.</p></div>
        <div className="method-grid">
          {methods.map((method) => (
            <article className="method-card" key={method.id}>
              <div className="method-topline"><h3>{method.name}</h3><span>250ml 기준</span></div>
              <p>{method.description}</p>
              <div className="method-inputs">
                <label><span>1잔 재료비</span><div className="input-with-unit compact"><input type="number" min="0" step="50" value={method.unitCost} onChange={(e) => updateMethod(method.id, 'unitCost', Number(e.target.value))} /><em>원</em></div></label>
                <label><span>장비 구입비</span><div className="input-with-unit compact"><input type="number" min="0" step="10000" value={method.equipmentCost} onChange={(e) => updateMethod(method.id, 'equipmentCost', Number(e.target.value))} /><em>원</em></div></label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="results-section">
        <div className="section-heading"><div><p className="section-kicker">RESULT</p><h2>1년 실질 커피값</h2></div><p className="muted">장비 구입비를 첫해에 전액 반영한 결과입니다.</p></div>
        <div className="winner-card">
          <div><span className="winner-label">가장 저렴한 방식</span><strong>{results[0]?.name}</strong></div>
          <div className="winner-price"><span>1년 총비용</span><strong>{formatWon(results[0]?.annualTotal ?? 0)}</strong><small>실질 1잔 {formatWon(results[0]?.effectiveCupCost ?? 0)}</small></div>
        </div>
        <div className="ranking-list">
          {results.map((result, index) => (
            <article className="ranking-row" key={result.id}>
              <div className="rank">{index + 1}</div>
              <div className="ranking-main">
                <div className="ranking-title"><div><strong>{result.name}</strong><span>재료비 {formatWon(result.annualIngredientCost)} + 장비 {formatWon(result.equipmentCost)}</span></div><div className="ranking-price"><strong>{formatWon(result.annualTotal)}</strong><span>1잔 {formatWon(result.effectiveCupCost)}</span></div></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(result.annualTotal / maxCost) * 100}%` }} /></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="table-card">
        <div className="section-heading"><div><p className="section-kicker">DETAIL</p><h2>상세 계산표</h2></div></div>
        <div className="table-scroll">
          <table><thead><tr><th>순위</th><th>방식</th><th>1잔 재료비</th><th>연간 재료비</th><th>장비비</th><th>1년 총비용</th><th>실질 1잔 가격</th></tr></thead>
            <tbody>{results.map((result, index) => (<tr key={result.id}><td>{index + 1}위</td><td>{result.name}</td><td>{formatWon(result.unitCost)}</td><td>{formatWon(result.annualIngredientCost)}</td><td>{formatWon(result.equipmentCost)}</td><td><strong>{formatWon(result.annualTotal)}</strong></td><td>{formatWon(result.effectiveCupCost)}</td></tr>))}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  const [mode, setMode] = useState<ViewMode>('simple');

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <span className="bean-mark" aria-hidden="true"><i /><i /></span>
          <div>
            <strong>믕스터리</strong>
            <small>커피가격계산기</small>
          </div>
        </div>
        <span className="header-note">BREW · COUNT · DISCOVER</span>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">MYSTERY IN EVERY CUP</p>
          <h1>매일의 한 잔,<br /><em>1년이면 얼마일까?</em></h1>
          <p className="hero-copy">
            나도 모르게 쌓이는 커피값의 미스터리를 풀어보세요.
            몇 가지 질문만으로 <strong>하루 비용, 연간 유지비, 음용량과 카페인</strong>을 명료하게 계산해드려요.
          </p>
        </div>
        <aside className="hero-preview">
          <div className="cup-ring" aria-hidden="true"><span>365</span></div>
          <p>YOUR COFFEE, DECODED</p>
          <ul>
            <li><span>01</span> 하루 한 잔의 실제 비용</li>
            <li><span>02</span> 장비까지 포함한 연간 유지비</li>
            <li><span>03</span> 음용량과 카페인 추정치</li>
          </ul>
        </aside>
      </section>

      <ModeSwitcher mode={mode} onChange={setMode} />
      {mode === 'simple' ? <SimpleCalculator /> : <ComparisonCalculator />}

      <footer>
        <strong>믕스터리 커피가격계산기</strong>
        <p>※ 모든 결과는 입력값을 바탕으로 한 추정치입니다. 원두 특성, 레시피, 제품 표시량과 실제 사용 환경에 따라 달라질 수 있습니다.</p>
      </footer>
    </main>
  );
}
