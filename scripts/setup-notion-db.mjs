import { Client } from "@notionhq/client";
import * as fs from "fs";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_DATABASE_ID;

async function main() {
  console.log("현재 DB 컬럼 조회 중...");
  const db = await notion.databases.retrieve({ database_id: DB_ID });

  const existingProps = db.properties ?? {};
  console.log("현재 컬럼:");
  Object.entries(existingProps).forEach(([name, prop]) => {
    console.log(`  - "${name}" (${prop.type}) [id: ${prop.id}]`);
  });

  // 이름(title) 외 모든 기존 컬럼 삭제 후 재생성
  const propsToDelete = {};
  for (const [name, prop] of Object.entries(existingProps)) {
    if (prop.type !== "title") {
      propsToDelete[name] = null;
    }
  }

  if (Object.keys(propsToDelete).length > 0) {
    console.log("\n기존 컬럼 삭제 중...");
    await notion.databases.update({
      database_id: DB_ID,
      properties: propsToDelete,
    });
    console.log("삭제 완료");
  }

  console.log("\n올바른 컬럼 추가 중...");
  await notion.databases.update({
    database_id: DB_ID,
    properties: {
      클라이언트명: { rich_text: {} },
      발행일: { date: {} },
      만료일: { date: {} },
      상태: {
        select: {
          options: [
            { name: "초안", color: "gray" },
            { name: "발송됨", color: "blue" },
            { name: "승인됨", color: "green" },
            { name: "거절됨", color: "red" },
          ],
        },
      },
      통화: {
        select: {
          options: [
            { name: "KRW", color: "yellow" },
            { name: "USD", color: "green" },
            { name: "EUR", color: "blue" },
          ],
        },
      },
      메모: { rich_text: {} },
      할인율: { number: { format: "percent" } },
      세율: { number: { format: "percent" } },
      소계: { number: { format: "number" } },
      총액: { number: { format: "number" } },
    },
  });

  console.log("\n최종 DB 컬럼:");
  const updated = await notion.databases.retrieve({ database_id: DB_ID });
  Object.entries(updated.properties).forEach(([name, prop]) => {
    console.log(`  ✓ "${name}" (${prop.type})`);
  });

  console.log("\nNotion DB 초기화 완료!");
}

main().catch(console.error);
