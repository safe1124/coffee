'use client';

import { useMemo, useState } from 'react';

type Method = {
  id: string;
  name: string;
  description: string;
  unitCost: number;
  equipmentCost: number;
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
    description: '캡슐 1개 30g 추출 + 물 220g',
    unitCost: 700,
    equipmentCost: 150000,
  },
  {
    id: 'espresso',
    name: '에스프레소 머신',
    description: '원두 20g → 60g 추출 + 물 190g',
    unitCost: 600,
    equipmentCost: 400000,
  },
  {
    id: 'brewing',
    name: '브루잉 484',
    description: '원두 20g → 160g 추출 + 물 90g',
    unitCost: 600,
    equipmentCost: 10000,
  },
];

const formatWon = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;

export default function Home() {
  const [cupsPerDay, setCupsPerDay] = useState(3);
  const [daysPerYear, setDaysPerYear] = useState(365);
  const [methods, setMethods] = useState(DEFAULT_METHODS);

  const annualCups = cupsPerDay * daysPerYear;

  const results = useMemo(
    () =>
      methods
        .map((method) => {
          const annualIngredientCost = method.unitCost * annualCups;
          const annualTotal = annualIngredientCost + method.equipmentCost;
          const effectiveCupCost = annualCups > 0 ? annualTotal / annualCups : 0;

          return {
            ...method,
            annualIngredientCost,
            annualTotal,
            effectiveCupCost,
          };
        })
        .sort((a, b) => a.annualTotal - b.annualTotal),
    [methods, annualCups]
  );

  const maxCost = Math.max(...results.map((result) => result.annualTotal), 1);

  const updateMethod = (id: string, field: 'unitCost' | 'equipmentCost', value: number) => {
    setMethods((current) =>
      current.map((method) =>
        method.id === id ? { ...method, [field]: Math.max(0, value || 0) } : method
      )
    );
  };

  const reset = () => {
    setCupsPerDay(3);
    setDaysPerYear(365);
    setMethods(DEFAULT_METHODS);
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">COFFEE COST LAB</p>
          <h1>1년 커피값 시뮬레이터</h1>
          <p className="hero-copy">
            병커피, 캡슐, 에스프레소, 브루잉의 실제 1년 비용을 같은 기준으로 비교해보세요.
            기본값은 <strong>얼음 제외 250ml · 하루 3잔</strong>입니다.
          </p>
        </div>
        <div className="hero-stat">
          <span>연간 음용량</span>
          <strong>{annualCups.toLocaleString('ko-KR')}잔</strong>
          <small>하루 {cupsPerDay}잔 × {daysPerYear}일</small>
        </div>
      </section>

      <section className="control-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">STEP 1</p>
            <h2>내 커피 습관 설정</h2>
          </div>
          <button className="ghost-button" onClick={reset}>기본값으로 초기화</button>
        </div>

        <div className="habit-grid">
          <label className="field">
            <span>하루 몇 잔?</span>
            <div className="input-with-unit">
              <input
                type="number"
                min="0"
                max="20"
                step="1"
                value={cupsPerDay}
                onChange={(e) => setCupsPerDay(Math.max(0, Number(e.target.value)))}
              />
              <em>잔</em>
            </div>
          </label>
          <label className="field">
            <span>1년에 마시는 날</span>
            <div className="input-with-unit">
              <input
                type="number"
                min="1"
                max="366"
                value={daysPerYear}
                onChange={(e) => setDaysPerYear(Math.min(366, Math.max(1, Number(e.target.value))))}
              />
              <em>일</em>
            </div>
          </label>
          <div className="summary-pill">
            <span>계산 기준</span>
            <strong>250ml / 1잔</strong>
            <small>얼음 제외 최종 음료량</small>
          </div>
        </div>
      </section>

      <section className="control-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">STEP 2</p>
            <h2>방식별 가격 조정</h2>
          </div>
          <p className="muted">현재 가격에 맞게 숫자만 바꾸면 결과가 즉시 갱신됩니다.</p>
        </div>

        <div className="method-grid">
          {methods.map((method) => (
            <article className="method-card" key={method.id}>
              <div className="method-topline">
                <h3>{method.name}</h3>
                <span>250ml 기준</span>
              </div>
              <p>{method.description}</p>
              <div className="method-inputs">
                <label>
                  <span>1잔 재료비</span>
                  <div className="input-with-unit compact">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={method.unitCost}
                      onChange={(e) => updateMethod(method.id, 'unitCost', Number(e.target.value))}
                    />
                    <em>원</em>
                  </div>
                </label>
                <label>
                  <span>장비 구입비</span>
                  <div className="input-with-unit compact">
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={method.equipmentCost}
                      onChange={(e) => updateMethod(method.id, 'equipmentCost', Number(e.target.value))}
                    />
                    <em>원</em>
                  </div>
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="results-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">RESULT</p>
            <h2>1년 실질 커피값</h2>
          </div>
          <p className="muted">장비 구입비를 첫해에 전액 반영한 결과입니다.</p>
        </div>

        <div className="winner-card">
          <div>
            <span className="winner-label">가장 저렴한 방식</span>
            <strong>{results[0]?.name}</strong>
          </div>
          <div className="winner-price">
            <span>1년 총비용</span>
            <strong>{formatWon(results[0]?.annualTotal ?? 0)}</strong>
            <small>실질 1잔 {formatWon(results[0]?.effectiveCupCost ?? 0)}</small>
          </div>
        </div>

        <div className="ranking-list">
          {results.map((result, index) => (
            <article className="ranking-row" key={result.id}>
              <div className="rank">{index + 1}</div>
              <div className="ranking-main">
                <div className="ranking-title">
                  <div>
                    <strong>{result.name}</strong>
                    <span>재료비 {formatWon(result.annualIngredientCost)} + 장비 {formatWon(result.equipmentCost)}</span>
                  </div>
                  <div className="ranking-price">
                    <strong>{formatWon(result.annualTotal)}</strong>
                    <span>1잔 {formatWon(result.effectiveCupCost)}</span>
                  </div>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(result.annualTotal / maxCost) * 100}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="table-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">DETAIL</p>
            <h2>상세 계산표</h2>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>순위</th>
                <th>방식</th>
                <th>1잔 재료비</th>
                <th>연간 재료비</th>
                <th>장비비</th>
                <th>1년 총비용</th>
                <th>실질 1잔 가격</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={result.id}>
                  <td>{index + 1}위</td>
                  <td>{result.name}</td>
                  <td>{formatWon(result.unitCost)}</td>
                  <td>{formatWon(result.annualIngredientCost)}</td>
                  <td>{formatWon(result.equipmentCost)}</td>
                  <td><strong>{formatWon(result.annualTotal)}</strong></td>
                  <td>{formatWon(result.effectiveCupCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        <p>※ 물값, 전기료, 세척제, 수리비, 종이필터 등 부대비용은 기본 계산에서 제외됩니다.</p>
      </footer>
    </main>
  );
}
