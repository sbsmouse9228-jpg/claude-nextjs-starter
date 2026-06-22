import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_DATABASE_ID;

const samples = [
  {
    이름: "웹사이트 개발 프로젝트",
    클라이언트명: "㈜테크스타트업",
    발행일: "2026-06-01",
    만료일: "2026-06-30",
    상태: "승인됨",
    통화: "KRW",
    메모: "랜딩페이지 + 관리자 대시보드 포함. 2차 수정까지 무상 제공.",
    할인율: 0.1,
    세율: 0.1,
    소계: 5000000,
    총액: 4950000,
    lineItems: [
      { 품목: "랜딩페이지 디자인 및 개발", 수량: 1, 단가: 2000000 },
      { 품목: "관리자 대시보드 개발", 수량: 1, 단가: 2500000 },
      { 품목: "반응형 모바일 최적화", 수량: 1, 단가: 500000 },
    ],
  },
  {
    이름: "모바일 앱 UI/UX 디자인",
    클라이언트명: "패션브랜드 MODA",
    발행일: "2026-06-10",
    만료일: "2026-07-10",
    상태: "발송됨",
    통화: "KRW",
    메모: "iOS / Android 동시 지원. 피그마 소스 파일 납품 포함.",
    할인율: 0,
    세율: 0.1,
    소계: 3200000,
    총액: 3520000,
    lineItems: [
      { 품목: "와이어프레임 설계 (20화면)", 수량: 1, 단가: 800000 },
      { 품목: "UI 디자인 (20화면)", 수량: 1, 단가: 1800000 },
      { 품목: "프로토타입 제작", 수량: 1, 단가: 400000 },
      { 품목: "디자인 시스템 구축", 수량: 1, 단가: 200000 },
    ],
  },
  {
    이름: "브랜드 아이덴티티 컨설팅",
    클라이언트명: "카페 드 루나",
    발행일: "2026-06-18",
    만료일: "2026-07-18",
    상태: "초안",
    통화: "KRW",
    메모: "로고, 명함, 메뉴판 디자인 포함. 수정 횟수 3회.",
    할인율: 0.05,
    세율: 0.1,
    소계: 1800000,
    총액: 1881000,
    lineItems: [
      { 품목: "로고 디자인", 수량: 1, 단가: 800000 },
      { 품목: "명함 디자인 (앞/뒤)", 수량: 1, 단가: 300000 },
      { 품목: "메뉴판 디자인", 수량: 2, 단가: 250000 },
      { 품목: "브랜드 가이드라인 문서", 수량: 1, 단가: 200000 },
    ],
  },
];

async function createPage(sample) {
  const page = await notion.pages.create({
    parent: { database_id: DB_ID },
    properties: {
      이름: { title: [{ text: { content: sample.이름 } }] },
      클라이언트명: { rich_text: [{ text: { content: sample.클라이언트명 } }] },
      발행일: { date: { start: sample.발행일 } },
      만료일: { date: { start: sample.만료일 } },
      상태: { select: { name: sample.상태 } },
      통화: { select: { name: sample.통화 } },
      메모: { rich_text: [{ text: { content: sample.메모 } }] },
      할인율: { number: sample.할인율 },
      세율: { number: sample.세율 },
      소계: { number: sample.소계 },
      총액: { number: sample.총액 },
    },
    children: [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ text: { content: "견적 항목" } }],
        },
      },
      {
        object: "block",
        type: "table",
        table: {
          table_width: 4,
          has_column_header: true,
          has_row_header: false,
          children: [
            {
              object: "block",
              type: "table_row",
              table_row: {
                cells: [
                  [{ text: { content: "품목" } }],
                  [{ text: { content: "수량" } }],
                  [{ text: { content: "단가" } }],
                  [{ text: { content: "소계" } }],
                ],
              },
            },
            ...sample.lineItems.map((item) => ({
              object: "block",
              type: "table_row",
              table_row: {
                cells: [
                  [{ text: { content: item.품목 } }],
                  [{ text: { content: String(item.수량) } }],
                  [{ text: { content: item.단가.toLocaleString("ko-KR") + "원" } }],
                  [{ text: { content: (item.수량 * item.단가).toLocaleString("ko-KR") + "원" } }],
                ],
              },
            })),
          ],
        },
      },
    ],
  });

  return page.id;
}

async function main() {
  console.log("샘플 견적서 3건 추가 중...\n");

  for (const sample of samples) {
    try {
      const id = await createPage(sample);
      console.log(`✓ "${sample.이름}" 생성 완료`);
      console.log(`  URL: https://app.notion.com/p/${id.replace(/-/g, "")}`);
      console.log(`  웹뷰어: /quote/${id.replace(/-/g, "")}\n`);
    } catch (e) {
      console.error(`✗ "${sample.이름}" 실패:`, e.message);
    }
  }

  console.log("완료!");
}

main().catch(console.error);
