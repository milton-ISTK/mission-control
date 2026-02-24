"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const CW = 1400;
const CH = 700;
const TW = 80;
const TH = 40;
const COLS = 12;
const ROWS = 10;
const OX = 660;
const OY = 120;

const ORG = "#F97316";
const ORG_DK = "#D06010";
const CYN = "#06B6D4";
const CYN_DK = "#0598B0";

interface AgentData {
  id: string;
  name: string;
  role: string;
  emoji: string;
  type: "agent" | "subagent";
  color: string;
  activity: "working" | "waiting" | "idle";
}

interface AgentDisplay {
  id: string;
  name: string;
  role: string;
  emoji: string;
  type: "agent" | "subagent";
  color: string;
  hair: string;
  hairDk: string;
  shirt: string;
  shirtDk: string;
  skin: string;
  skinDk: string;
  female: boolean;
}

const AGENTS: Array<AgentDisplay & { id: string }> = [
  // ── AGENTS (orange shirts) ──
  {
    id: "blogwriter",
    name: "Blog Writer",
    role: "Long-Form Content Writer",
    emoji: "✍️",
    type: "agent",
    color: "#F97316",
    hair: "#222",
    hairDk: "#111",
    shirt: ORG,
    shirtDk: ORG_DK,
    skin: "#F5D0B0",
    skinDk: "#DDB898",
    female: false,
  },
  {
    id: "copywriter",
    name: "Copywriter",
    role: "Social Media Copywriter",
    emoji: "📝",
    type: "agent",
    color: "#F97316",
    hair: "#8B4513",
    hairDk: "#6B3410",
    shirt: ORG,
    shirtDk: ORG_DK,
    skin: "#C49A6C",
    skinDk: "#A88050",
    female: true,
  },
  {
    id: "gregory",
    name: "Gregory",
    role: "CEO / Founder",
    emoji: "👔",
    type: "agent",
    color: "#F97316",
    hair: "#B8860B",
    hairDk: "#8B6508",
    shirt: ORG,
    shirtDk: ORG_DK,
    skin: "#F0D0B8",
    skinDk: "#D8B8A0",
    female: false,
  },
  {
    id: "milton",
    name: "Milton",
    role: "Chief of Staff / Executive AI",
    emoji: "🤖",
    type: "agent",
    color: "#F97316",
    hair: "#6A5ACD",
    hairDk: "#5040A8",
    shirt: ORG,
    shirtDk: ORG_DK,
    skin: "#D8C0A8",
    skinDk: "#C0A890",
    female: false,
  },
  {
    id: "research",
    name: "Res. Enhancer",
    role: "Research Enhancement Specialist",
    emoji: "🔬",
    type: "agent",
    color: "#F97316",
    hair: "#1A1A1A",
    hairDk: "#0A0A0A",
    shirt: ORG,
    shirtDk: ORG_DK,
    skin: "#8D6E4C",
    skinDk: "#7A5E3E",
    female: true,
  },
  {
    id: "publisher",
    name: "Soc. Publisher",
    role: "Multi-Platform Publisher",
    emoji: "📡",
    type: "agent",
    color: "#F97316",
    hair: "#DC143C",
    hairDk: "#B0102F",
    shirt: ORG,
    shirtDk: ORG_DK,
    skin: "#BA8C6A",
    skinDk: "#A07850",
    female: false,
  },
  // ── SUBAGENTS (cyan shirts) ──
  {
    id: "headline",
    name: "Headline Gen",
    role: "Headlines & Hooks Specialist",
    emoji: "💡",
    type: "subagent",
    color: "#06B6D4",
    hair: "#FFD700",
    hairDk: "#CCB000",
    shirt: CYN,
    shirtDk: CYN_DK,
    skin: "#F5D0B0",
    skinDk: "#DDB898",
    female: true,
  },
  {
    id: "htmlbuilder",
    name: "HTML Builder",
    role: "HTML/CSS Production Specialist",
    emoji: "🏗️",
    type: "subagent",
    color: "#06B6D4",
    hair: "#0891B2",
    hairDk: "#067A96",
    shirt: CYN,
    shirtDk: CYN_DK,
    skin: "#C49A6C",
    skinDk: "#A88050",
    female: false,
  },
  {
    id: "humanizer",
    name: "Humanizer",
    role: "Content Humanization Specialist",
    emoji: "👻",
    type: "subagent",
    color: "#06B6D4",
    hair: "#2E8B57",
    hairDk: "#1E6B40",
    shirt: CYN,
    shirtDk: CYN_DK,
    skin: "#F0D0B8",
    skinDk: "#D8B8A0",
    female: false,
  },
  {
    id: "imagemaker",
    name: "Image Maker",
    role: "Visual Content Creator",
    emoji: "🎨",
    type: "subagent",
    color: "#06B6D4",
    hair: "#FF69B4",
    hairDk: "#D05090",
    shirt: CYN,
    shirtDk: CYN_DK,
    skin: "#8D6E4C",
    skinDk: "#7A5E3E",
    female: true,
  },
  {
    id: "newsscraper",
    name: "News Scraper",
    role: "News & Data Aggregator",
    emoji: "📰",
    type: "subagent",
    color: "#06B6D4",
    hair: "#1A1A1A",
    hairDk: "#0A0A0A",
    shirt: CYN,
    shirtDk: CYN_DK,
    skin: "#BA8C6A",
    skinDk: "#A07850",
    female: false,
  },
  {
    id: "sentiment",
    name: "Sent. Scraper",
    role: "Market Sentiment Analyst",
    emoji: "🔍",
    type: "subagent",
    color: "#06B6D4",
    hair: "#A0522D",
    hairDk: "#804020",
    shirt: CYN,
    shirtDk: CYN_DK,
    skin: "#F5D8C0",
    skinDk: "#DDC0A8",
    female: true,
  },
];

const DESK1 = { row: 4, stations: [1.3, 2.5, 3.7, 4.9, 6.1, 7.3] };
const DESK2 = { row: 6.5, stations: [1.3, 2.5, 3.7, 4.9, 6.1, 7.3] };

const STATIONS = [
  ...DESK1.stations.map((c) => ({ col: c, deskRow: DESK1.row, seatRow: DESK1.row - 0.8 })),
  ...DESK2.stations.map((c) => ({ col: c, deskRow: DESK2.row, seatRow: DESK2.row - 0.8 })),
];

function iso(c: number, r: number) {
  return { x: OX + (c - r) * (TW / 2), y: OY + (c + r) * (TH / 2) };
}

function isoBox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  d: number,
  h: number,
  topC: string,
  leftC: string,
  rightC: string
) {
  const hw = w / 2,
    hd = d / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - h);
  ctx.lineTo(cx + hw, cy - h + hd);
  ctx.lineTo(cx, cy - h + d);
  ctx.lineTo(cx - hw, cy - h + hd);
  ctx.closePath();
  ctx.fillStyle = topC;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy - h + hd);
  ctx.lineTo(cx, cy - h + d);
  ctx.lineTo(cx, cy + d);
  ctx.lineTo(cx - hw, cy + hd);
  ctx.closePath();
  ctx.fillStyle = leftC;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + hw, cy - h + hd);
  ctx.lineTo(cx, cy - h + d);
  ctx.lineTo(cx, cy + d);
  ctx.lineTo(cx + hw, cy + hd);
  ctx.closePath();
  ctx.fillStyle = rightC;
  ctx.fill();
}

function p(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
}

function isoQuad(
  ctx: CanvasRenderingContext2D,
  c1: number,
  r1: number,
  c2: number,
  r2: number,
  c3: number,
  r3: number,
  c4: number,
  r4: number,
  fill: string
) {
  const p1 = iso(c1, r1),
    p2 = iso(c2, r2),
    p3 = iso(c3, r3),
    p4 = iso(c4, r4);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawFloor(ctx: CanvasRenderingContext2D) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const { x, y } = iso(c, r);
      const ck = (c + r) % 2 === 0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + TW / 2, y + TH / 2);
      ctx.lineTo(x, y + TH);
      ctx.lineTo(x - TW / 2, y + TH / 2);
      ctx.closePath();
      ctx.fillStyle = ck ? "#8B9DAF" : "#7E8F9F";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + TW / 2, y + TH / 2);
      ctx.strokeStyle = ck ? "#98AAB8" : "#8A9CAC";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - TW / 2, y + TH / 2);
      ctx.strokeStyle = ck ? "#7A8C9E" : "#6E8090";
      ctx.stroke();
    }
  }

  const bl = iso(0, ROWS),
    br = iso(COLS, ROWS),
    brc = iso(COLS, 0);
  ctx.beginPath();
  ctx.moveTo(bl.x - TW / 2, bl.y + TH / 2);
  ctx.lineTo(br.x, br.y + TH);
  ctx.lineTo(br.x, br.y + TH + 10);
  ctx.lineTo(bl.x - TW / 2, bl.y + TH / 2 + 10);
  ctx.closePath();
  ctx.fillStyle = "#5A6A78";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(br.x, br.y + TH);
  ctx.lineTo(brc.x + TW / 2, brc.y + TH / 2);
  ctx.lineTo(brc.x + TW / 2, brc.y + TH / 2 + 10);
  ctx.lineTo(br.x, br.y + TH + 10);
  ctx.closePath();
  ctx.fillStyle = "#4A5A68";
  ctx.fill();
}

function drawRug(ctx: CanvasRenderingContext2D) {
  isoQuad(ctx, 7, 0.8, 11.2, 0.8, 11.2, 4, 7, 4, "#4A2030");
  isoQuad(ctx, 7.3, 1.1, 10.9, 1.1, 10.9, 3.7, 7.3, 3.7, "#5C2840");
  isoQuad(ctx, 7.6, 1.4, 10.6, 1.4, 10.6, 3.4, 7.6, 3.4, "#6A3050");
  const a = iso(7.5, 1.3),
    b = iso(10.7, 1.3),
    c2 = iso(10.7, 3.5),
    d = iso(7.5, 3.5);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c2.x, c2.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.strokeStyle = "#F9731644";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawWalls(ctx: CanvasRenderingContext2D) {
  const WH = 140;
  for (let c = 0; c < COLS; c++) {
    const { x, y } = iso(c, 0);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + TW / 2, y + TH / 2);
    ctx.lineTo(x + TW / 2, y + TH / 2 - WH);
    ctx.lineTo(x, y - WH);
    ctx.closePath();
    ctx.fillStyle = c % 2 === 0 ? "#B8C8D4" : "#B0C0CC";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + TW / 2, y + TH / 2);
    ctx.lineTo(x + TW / 2, y + TH / 2 - WH);
    ctx.strokeStyle = "#A0B0BC";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (let r = 0; r < ROWS; r++) {
    const { x, y } = iso(0, r);
    const x1 = x - TW / 2,
      y1 = y + TH / 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - WH);
    ctx.lineTo(x1, y1 - WH);
    ctx.closePath();
    ctx.fillStyle = r % 2 === 0 ? "#9AACB8" : "#92A4B0";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - WH);
    ctx.strokeStyle = "#88A0AC";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (let c = 0; c < COLS; c++) {
    const { x, y } = iso(c, 0);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + TW / 2, y + TH / 2);
    ctx.lineTo(x + TW / 2, y + TH / 2 - 8);
    ctx.lineTo(x, y - 8);
    ctx.closePath();
    ctx.fillStyle = "#F97316";
    ctx.fill();
  }
  for (let r = 0; r < ROWS; r++) {
    const { x, y } = iso(0, r);
    const x1 = x - TW / 2,
      y1 = y + TH / 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - 8);
    ctx.lineTo(x1, y1 - 8);
    ctx.closePath();
    ctx.fillStyle = "#D06010";
    ctx.fill();
  }
  const cn = iso(0, 0);
  p(ctx, cn.x - TW / 2, cn.y + TH / 2 - WH, 2, WH, "#F97316");

  [1.5, 4, 6.5, 9, 11].forEach((c) => {
    const { x, y } = iso(c, 0);
    const wx = x + 6,
      wy = y + TH / 2 - 118;
    p(ctx, wx - 1, wy - 1, 32, 56, "#90A0AC");
    p(ctx, wx, wy, 30, 54, "#A0B0BC");
    p(ctx, wx + 2, wy + 2, 12, 22, "#4A7A9A");
    p(ctx, wx + 16, wy + 2, 12, 22, "#4A7A9A");
    p(ctx, wx + 2, wy + 26, 12, 22, "#3A6A8A");
    p(ctx, wx + 16, wy + 26, 12, 22, "#3A6A8A");
    p(ctx, wx + 3, wy + 3, 4, 8, "#5A8AAA");
    p(ctx, wx + 17, wy + 3, 4, 8, "#5A8AAA");
    p(ctx, wx + 14, wy, 2, 54, "#A0B0BC");
    p(ctx, wx, wy + 24, 30, 2, "#A0B0BC");
    p(ctx, wx - 2, wy + 53, 34, 3, "#C0D0D8");
  });
  [2, 5, 8].forEach((r) => {
    const { x, y } = iso(0, r);
    const wx = x - TW / 2 - 8,
      wy = y + TH / 2 - 118;
    p(ctx, wx - 1, wy - 1, 28, 56, "#7890A0");
    p(ctx, wx, wy, 26, 54, "#8898A8");
    p(ctx, wx + 2, wy + 2, 10, 22, "#3A6888");
    p(ctx, wx + 14, wy + 2, 10, 22, "#3A6888");
    p(ctx, wx + 2, wy + 26, 10, 22, "#305A78");
    p(ctx, wx + 14, wy + 26, 10, 22, "#305A78");
    p(ctx, wx + 12, wy, 2, 54, "#8898A8");
    p(ctx, wx, wy + 24, 26, 2, "#8898A8");
  });
}

function drawLongDesk(ctx: CanvasRenderingContext2D, startCol: number, endCol: number, row: number) {
  const dd = 0.7;
  isoQuad(ctx, startCol, row, endCol, row, endCol, row + dd, startCol, row + dd, "#E8E0D8");
  const fl = iso(startCol, row + dd),
    fr = iso(endCol, row + dd);
  const h = 18;
  ctx.beginPath();
  ctx.moveTo(fl.x, fl.y);
  ctx.lineTo(fr.x, fr.y);
  ctx.lineTo(fr.x, fr.y + h);
  ctx.lineTo(fl.x, fl.y + h);
  ctx.closePath();
  ctx.fillStyle = "#C8C0B8";
  ctx.fill();
  const bl = iso(startCol, row);
  ctx.beginPath();
  ctx.moveTo(bl.x, bl.y);
  ctx.lineTo(fl.x, fl.y);
  ctx.lineTo(fl.x, fl.y + h);
  ctx.lineTo(bl.x, bl.y + h);
  ctx.closePath();
  ctx.fillStyle = "#B0A898";
  ctx.fill();
  isoQuad(
    ctx,
    startCol + 0.15,
    row + 0.08,
    endCol - 0.15,
    row + 0.08,
    endCol - 0.15,
    row + dd - 0.08,
    startCol + 0.15,
    row + dd - 0.08,
    "#F0E8E0"
  );
  const legs = [startCol + 0.3, (startCol + endCol) / 2, endCol - 0.3];
  legs.forEach((lc) => {
    const lp = iso(lc, row + dd);
    p(ctx, lp.x - 1, lp.y, 3, 12, "#A09890");
  });
}

function drawMonitor(ctx: CanvasRenderingContext2D, col: number, row: number, active: boolean, frame: number) {
  const { x, y } = iso(col, row + 0.35);
  const mx = x,
    my = y - 40;
  isoBox(ctx, mx, my + 10, 30, 6, 22, "#3A3A3A", "#2A2A2A", "#1E1E1E");
  p(ctx, mx - 13, my - 10, 26, 20, "#2A2A2A");
  p(ctx, mx - 11, my - 8, 22, 15, active ? "#1A2A38" : "#0A0E14");
  p(ctx, mx - 13, my + 9, 26, 2, "#333");
  p(ctx, mx - 1, my + 9, 3, 1.5, active ? "#10B981" : "#333");
  isoBox(ctx, mx, my + 15, 7, 4, 3, "#444", "#333", "#282828");
  isoBox(ctx, mx, my + 18, 18, 7, 2, "#3A3A3A", "#2A2A2A", "#1E1E1E");
  if (active) {
    p(ctx, mx - 11, my - 8, 22, 2, "#1E2A36");
    p(ctx, mx - 10, my - 8, 8, 2, "#2A3A4A");
    p(ctx, mx - 10, my - 8, 8, 0.7, "#F97316");
    const colors = ["#F97316", "#5EAAD6", "#50C87A", "#E8B840", "#9A70E8", "#E85070", "#40B8D0", "#88C830"];
    const scr = Math.floor(frame * 0.5);
    for (let i = 0; i < 5; i++) {
      const ly = my - 5 + i * 2.2,
        ci = (i + scr) % colors.length,
        indent = ((i + scr) % 4) * 2,
        w = 3 + ((i + scr) % 5) * 2;
      p(ctx, mx - 10, ly, 2, 1.2, "#2A3A4A");
      p(ctx, mx - 7 + indent, ly, Math.min(w, 17 - indent), 1.2, colors[ci]);
    }
    if (frame % 8 < 4) p(ctx, mx + 6, my - 5 + ((scr % 5) * 2.2), 1, 1.5, "#FFF");
    p(ctx, mx - 11, my + 5.5, 22, 1.5, "#1E2A36");
    p(ctx, mx - 10, my + 6, 4, 1, "#F97316");
  }
  isoBox(ctx, mx, my + 24, 18, 7, 1, "#444", "#333", "#282828");
  for (let i = 0; i < 7; i++) p(ctx, mx - 7 + i * 2.2, my + 22, 1.6, 1, "#555");
  p(ctx, mx - 4, my + 24, 6, 1, "#505050");
  isoBox(ctx, mx + 14, my + 24, 5, 4, 1, "#444", "#333", "#282828");
}

function drawChair(ctx: CanvasRenderingContext2D, x: number, y: number) {
  isoBox(ctx, x, y - 4, 18, 14, 3, "#3A3A3A", "#2A2A2A", "#1E1E1E");
  isoBox(ctx, x - 5, y - 16, 5, 14, 16, "#444", "#333", "#282828");
  p(ctx, x - 8, y - 32, 6, 2, "#4A4A4A");
  isoBox(ctx, x - 8, y - 8, 4, 14, 2, "#4A4A4A", "#3A3A3A", "#2E2E2E");
  isoBox(ctx, x + 5, y - 8, 4, 14, 2, "#4A4A4A", "#3A3A3A", "#2E2E2E");
  p(ctx, x - 1, y, 2, 6, "#333");
  ctx.fillStyle = "#2A2A2A";
  [
    [x - 6, y + 7],
    [x + 6, y + 7],
    [x, y + 8.5],
  ].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#444";
  [
    [x - 6, y + 6],
    [x + 6, y + 6],
  ].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSofa(ctx: CanvasRenderingContext2D) {
  isoQuad(ctx, 6.5, 0.8, 10.5, 0.8, 10.5, 2, 6.5, 2, "#3A3648");
  isoQuad(ctx, 6.7, 0.9, 8.5, 0.9, 8.5, 1.85, 6.7, 1.85, "#444058");
  isoQuad(ctx, 8.7, 0.9, 10.3, 0.9, 10.3, 1.85, 8.7, 1.85, "#444058");
  const sf1 = iso(6.5, 2),
    sf2 = iso(10.5, 2);
  ctx.beginPath();
  ctx.moveTo(sf1.x, sf1.y);
  ctx.lineTo(sf2.x, sf2.y);
  ctx.lineTo(sf2.x, sf2.y + 12);
  ctx.lineTo(sf1.x, sf1.y + 12);
  ctx.closePath();
  ctx.fillStyle = "#2E2A3C";
  ctx.fill();
  const sb1 = iso(6.5, 0.8);
  ctx.beginPath();
  ctx.moveTo(sb1.x, sb1.y);
  ctx.lineTo(sf1.x, sf1.y);
  ctx.lineTo(sf1.x, sf1.y + 12);
  ctx.lineTo(sb1.x, sb1.y + 12);
  ctx.closePath();
  ctx.fillStyle = "#242030";
  ctx.fill();
  isoQuad(ctx, 6.5, 0.3, 10.5, 0.3, 10.5, 0.8, 6.5, 0.8, "#3A3648");
  const bk1 = iso(6.5, 0.3),
    bk2 = iso(10.5, 0.3);
  const bk3 = iso(6.5, 0.8),
    bk4 = iso(10.5, 0.8);
  ctx.beginPath();
  ctx.moveTo(bk3.x, bk3.y);
  ctx.lineTo(bk4.x, bk4.y);
  ctx.lineTo(bk4.x, bk4.y - 20);
  ctx.lineTo(bk3.x, bk3.y - 20);
  ctx.closePath();
  ctx.fillStyle = "#2E2A3C";
  ctx.fill();
  isoQuad(ctx, 6.5, 0.3, 10.5, 0.3, 10.5, 0.8, 6.5, 0.8, "#444058");
  const bt1 = iso(6.5, 0.3),
    bt2 = iso(10.5, 0.3),
    bt3 = iso(10.5, 0.8),
    bt4 = iso(6.5, 0.8);
  ctx.beginPath();
  ctx.moveTo(bt1.x, bt1.y - 20);
  ctx.lineTo(bt2.x, bt2.y - 20);
  ctx.lineTo(bt3.x, bt3.y - 20);
  ctx.lineTo(bt4.x, bt4.y - 20);
  ctx.closePath();
  ctx.fillStyle = "#444058";
  ctx.fill();
  isoQuad(ctx, 10.5, 0.8, 11.2, 0.8, 11.2, 3.5, 10.5, 3.5, "#3A3648");
  isoQuad(ctx, 10.55, 0.9, 11.1, 0.9, 11.1, 3.4, 10.55, 3.4, "#444058");
  const a2f1 = iso(11.2, 0.8),
    a2f2 = iso(11.2, 3.5);
  ctx.beginPath();
  ctx.moveTo(a2f1.x, a2f1.y);
  ctx.lineTo(a2f2.x, a2f2.y);
  ctx.lineTo(a2f2.x, a2f2.y + 12);
  ctx.lineTo(a2f1.x, a2f1.y + 12);
  ctx.closePath();
  ctx.fillStyle = "#2E2A3C";
  ctx.fill();
  const a2b = iso(10.5, 3.5),
    a2b2 = iso(11.2, 3.5);
  ctx.beginPath();
  ctx.moveTo(a2b.x, a2b.y);
  ctx.lineTo(a2b2.x, a2b2.y);
  ctx.lineTo(a2b2.x, a2b2.y + 12);
  ctx.lineTo(a2b.x, a2b.y + 12);
  ctx.closePath();
  ctx.fillStyle = "#242030";
  ctx.fill();
  isoQuad(ctx, 10.3, 3.3, 11.4, 3.3, 11.4, 3.8, 10.3, 3.8, "#3A3648");
  const ar1 = iso(10.3, 3.3),
    ar2 = iso(11.4, 3.3),
    ar3 = iso(11.4, 3.8),
    ar4 = iso(10.3, 3.8);
  ctx.beginPath();
  ctx.moveTo(ar3.x, ar3.y - 8);
  ctx.lineTo(ar4.x, ar4.y - 8);
  ctx.lineTo(ar4.x, ar4.y);
  ctx.lineTo(ar3.x, ar3.y);
  ctx.closePath();
  ctx.fillStyle = "#2E2A3C";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ar2.x, ar2.y - 8);
  ctx.lineTo(ar3.x, ar3.y - 8);
  ctx.lineTo(ar3.x, ar3.y);
  ctx.lineTo(ar2.x, ar2.y);
  ctx.closePath();
  ctx.fillStyle = "#242030";
  ctx.fill();
  isoQuad(ctx, 6, 0.5, 6.5, 0.5, 6.5, 2.2, 6, 2.2, "#3A3648");
  const al1 = iso(6, 2.2),
    al2 = iso(6.5, 2.2);
  ctx.beginPath();
  ctx.moveTo(al1.x, al1.y - 8);
  ctx.lineTo(al2.x, al2.y - 8);
  ctx.lineTo(al2.x, al2.y);
  ctx.lineTo(al1.x, al1.y);
  ctx.closePath();
  ctx.fillStyle = "#2E2A3C";
  ctx.fill();
  const pp1 = iso(7.5, 1.2);
  isoBox(ctx, pp1.x, pp1.y - 16, 14, 8, 10, "#F97316", "#D06010", "#B85010");
  const pp2 = iso(9.5, 1.2);
  isoBox(ctx, pp2.x, pp2.y - 16, 14, 8, 10, "#EAB308", "#C29806", "#A88005");
  const pp3 = iso(10.8, 2.2);
  isoBox(ctx, pp3.x, pp3.y - 16, 10, 8, 10, "#F43F5E", "#D0354E", "#B02A40");
}

function drawChar(ctx: CanvasRenderingContext2D, cx: number, cy: number, a: AgentDisplay, state: string, frame: number) {
  const x = Math.round(cx),
    y = Math.round(cy);
  const { hair, hairDk, shirt, shirtDk, skin: sL, skinDk: sD, female } = a;
  const pL = "#384058",
    pD = "#2C3448";
  ctx.fillStyle = "#00000022";
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  drawChair(ctx, x, y);
  p(ctx, x - 8, y - 16, 7, 12, pL);
  p(ctx, x - 2, y - 16, 1, 12, pD);
  p(ctx, x + 1, y - 16, 7, 12, pL);
  p(ctx, x + 7, y - 16, 1, 12, pD);
  p(ctx, x - 8, y - 16, 16, 2, "#222");
  p(ctx, x - 3, y - 15, 7, 1.5, "#555");
  p(ctx, x - 9, y - 4, 8, 4, "#2A2A2A");
  p(ctx, x - 9, y - 4, 8, 1.5, "#3A3A3A");
  p(ctx, x + 2, y - 4, 8, 4, "#2A2A2A");
  p(ctx, x + 2, y - 4, 8, 1.5, "#3A3A3A");
  p(ctx, x - 8, y - 33, 16, 17, shirt);
  p(ctx, x + 6, y - 33, 2, 17, shirtDk);
  p(ctx, x - 3, y - 33, 7, 3, shirtDk);
  p(ctx, x - 1, y - 33, 4, 4, sL);
  p(ctx, x - 0.5, y - 28, 1, 2, shirtDk + "66");
  p(ctx, x - 0.5, y - 24, 1, 2, shirtDk + "66");
  if (state === "working") {
    const bob = frame % 4 < 2 ? 0 : 1;
    p(ctx, x - 13, y - 31, 5, 14, shirt);
    p(ctx, x - 13, y - 31, 1, 14, shirtDk);
    p(ctx, x - 14, y - 18 + bob, 5, 4, sL);
    p(ctx, x - 14, y - 15 + bob, 3, 2, sD);
    p(ctx, x + 8, y - 31, 5, 14, shirt);
    p(ctx, x + 12, y - 31, 1, 14, shirtDk);
    p(ctx, x + 9, y - 18 - bob, 5, 4, sL);
    p(ctx, x + 12, y - 15 - bob, 3, 2, sD);
  } else {
    p(ctx, x - 10, y - 22, 20, 5, shirt);
    p(ctx, x - 10, y - 22, 20, 1, shirtDk);
    p(ctx, x - 10, y - 21, 4, 3, sL);
    p(ctx, x + 6, y - 21, 4, 3, sL);
  }
  p(ctx, x - 2, y - 36, 5, 4, sL);
  p(ctx, x + 2, y - 36, 1, 4, sD);
  p(ctx, x - 9, y - 56, 18, 20, sL);
  p(ctx, x + 7, y - 56, 2, 20, sD);
  p(ctx, x - 8, y - 57, 16, 2, sL);
  p(ctx, x - 11, y - 51, 3, 5, sL);
  p(ctx, x - 11, y - 49, 1, 3, sD);
  p(ctx, x + 8, y - 51, 3, 5, sD);

  // Hair
  if (female) {
    // Long hair — flows down past shoulders
    p(ctx, x - 10, y - 63, 20, 10, hair);
    p(ctx, x + 8, y - 63, 2, 10, hairDk);
    p(ctx, x - 9, y - 66, 18, 5, hair);
    p(ctx, x + 7, y - 66, 2, 5, hairDk);
    p(ctx, x - 10, y - 56, 4, 3, hair);
    p(ctx, x - 10, y - 56, 2, 6, hair);
    p(ctx, x + 7, y - 56, 3, 3, hair);
    p(ctx, x + 8, y - 56, 2, 6, hair);
    // Long strands down sides
    p(ctx, x - 12, y - 53, 3, 22, hair);
    p(ctx, x - 12, y - 53, 1, 22, hairDk);
    p(ctx, x + 9, y - 53, 3, 22, hair);
    p(ctx, x + 11, y - 53, 1, 22, hairDk);
    // Fringe/bangs
    p(ctx, x - 8, y - 63, 16, 4, hair);
    p(ctx, x - 6, y - 65, 12, 2, hair);
  } else {
    // Short hair
    p(ctx, x - 10, y - 63, 20, 10, hair);
    p(ctx, x + 8, y - 63, 2, 10, hairDk);
    p(ctx, x - 9, y - 66, 18, 5, hair);
    p(ctx, x + 7, y - 66, 2, 5, hairDk);
    p(ctx, x - 9, y - 56, 7, 3, hair);
    p(ctx, x - 9, y - 56, 2, 5, hair);
    p(ctx, x - 8, y - 65, 10, 1, hair);
  }

  // Eyes
  p(ctx, x - 5, y - 51, 4, 4, "#FFF");
  p(ctx, x + 2, y - 51, 4, 4, "#FFF");
  if (state === "working") {
    p(ctx, x - 4, y - 50, 2, 3, "#1A1A2A");
    p(ctx, x + 3, y - 50, 2, 3, "#1A1A2A");
  } else {
    p(ctx, x - 4, y - 51, 2, 2, "#1A1A2A");
    p(ctx, x + 3, y - 51, 2, 2, "#1A1A2A");
  }
  p(ctx, x - 5, y - 51, 1, 1, "#FFF");
  p(ctx, x + 2, y - 51, 1, 1, "#FFF");
  // Eyebrows
  p(ctx, x - 5, y - 53, 4, 1.5, hairDk);
  p(ctx, x + 2, y - 53, 4, 1.5, hairDk);

  if (female) {
    // Eyelashes
    p(ctx, x - 6, y - 52, 1, 2, "#1A1A2A");
    p(ctx, x + 6, y - 52, 1, 2, "#1A1A2A");
    // Lips
    p(ctx, x - 0.5, y - 47, 2, 3, sD);
    p(ctx, x - 2, y - 43, 5, 2, "#C06068");
    p(ctx, x - 1.5, y - 43, 4, 1, "#D07078");
  } else {
    p(ctx, x - 0.5, y - 47, 2, 3, sD);
    p(ctx, x - 2, y - 43, 5, 1.5, "#C08060");
  }
}

function drawCharSofa(ctx: CanvasRenderingContext2D, cx: number, cy: number, a: AgentDisplay, frame: number) {
  const x = Math.round(cx),
    y = Math.round(cy);
  const { hair, hairDk, shirt, shirtDk, color, skin: sL, skinDk: sD, female } = a;
  const pL = "#384058";
  ctx.fillStyle = "#00000018";
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  p(ctx, x - 7, y - 10, 6, 8, pL);
  p(ctx, x + 1, y - 10, 6, 8, pL);
  p(ctx, x - 7, y - 10, 14, 2, "#222");
  p(ctx, x - 8, y - 2, 7, 3, "#2A2A2A");
  p(ctx, x + 2, y - 2, 7, 3, "#2A2A2A");
  p(ctx, x - 7, y - 26, 14, 16, shirt);
  p(ctx, x + 5, y - 26, 2, 16, shirtDk);
  p(ctx, x - 3, y - 26, 6, 3, shirtDk);
  p(ctx, x - 1, y - 26, 3, 3, sL);
  p(ctx, x - 11, y - 24, 4, 12, shirt);
  p(ctx, x - 11, y - 24, 1, 12, shirtDk);
  p(ctx, x + 7, y - 24, 4, 12, shirt);
  p(ctx, x + 10, y - 24, 1, 12, shirtDk);
  p(ctx, x - 11, y - 12, 4, 3, sL);
  p(ctx, x + 7, y - 12, 4, 3, sL);
  p(ctx, x - 2, y - 28, 5, 3, sL);
  p(ctx, x - 8, y - 46, 16, 18, sL);
  p(ctx, x + 6, y - 46, 2, 18, sD);
  p(ctx, x - 7, y - 47, 14, 2, sL);
  p(ctx, x - 10, y - 42, 3, 5, sL);
  p(ctx, x + 7, y - 42, 3, 5, sD);

  // Hair
  if (female) {
    p(ctx, x - 9, y - 53, 18, 10, hair);
    p(ctx, x + 7, y - 53, 2, 10, hairDk);
    p(ctx, x - 8, y - 56, 16, 5, hair);
    p(ctx, x + 6, y - 56, 2, 5, hairDk);
    p(ctx, x - 9, y - 46, 3, 2, hair);
    p(ctx, x - 9, y - 46, 2, 5, hair);
    p(ctx, x + 7, y - 46, 2, 2, hair);
    p(ctx, x + 7, y - 46, 2, 5, hair);
    // Long strands
    p(ctx, x - 11, y - 44, 3, 18, hair);
    p(ctx, x - 11, y - 44, 1, 18, hairDk);
    p(ctx, x + 8, y - 44, 3, 18, hair);
    p(ctx, x + 10, y - 44, 1, 18, hairDk);
    p(ctx, x - 7, y - 53, 14, 3, hair);
  } else {
    p(ctx, x - 9, y - 53, 18, 10, hair);
    p(ctx, x + 7, y - 53, 2, 10, hairDk);
    p(ctx, x - 8, y - 56, 16, 5, hair);
    p(ctx, x + 6, y - 56, 2, 5, hairDk);
    p(ctx, x - 8, y - 46, 6, 2, hair);
    p(ctx, x - 8, y - 46, 2, 4, hair);
  }

  // Eyes
  p(ctx, x - 5, y - 42, 3, 3, "#FFF");
  p(ctx, x + 2, y - 42, 3, 3, "#FFF");
  p(ctx, x - 4, y - 41, 2, 2, "#1A1A2A");
  p(ctx, x + 3, y - 41, 2, 2, "#1A1A2A");
  p(ctx, x - 5, y - 42, 1, 1, "#FFF");
  p(ctx, x + 2, y - 42, 1, 1, "#FFF");
  p(ctx, x - 5, y - 44, 3, 1, hairDk);
  p(ctx, x + 2, y - 44, 3, 1, hairDk);

  if (female) {
    p(ctx, x - 6, y - 43, 1, 2, "#1A1A2A");
    p(ctx, x + 5, y - 43, 1, 2, "#1A1A2A");
    p(ctx, x - 0.5, y - 39, 2, 2, sD);
    p(ctx, x - 2, y - 36, 5, 2, "#C06068");
    p(ctx, x - 1.5, y - 36, 4, 1, "#D07078");
  } else {
    p(ctx, x - 0.5, y - 39, 2, 2, sD);
    p(ctx, x - 2, y - 36, 5, 1.5, "#C08060");
  }

  ctx.fillStyle = color;
  ctx.font = "bold 8px 'Courier New',monospace";
  ctx.textAlign = "center";
  ctx.fillText(a.name.toUpperCase(), x, y + 8);
}

function drawBub(ctx: CanvasRenderingContext2D, x: number, y: number, state: string, frame: number) {
  const bx = x - 14,
    by = state === "idle" ? y - 66 : y - 74;
  if (state === "working") {
    p(ctx, bx + 2, by, 28, 16, "#1E2030");
    p(ctx, bx, by + 2, 32, 12, "#1E2030");
    p(ctx, bx + 2, by, 28, 1.5, "#F97316");
    p(ctx, bx + 13, by + 16, 6, 3, "#1E2030");
    p(ctx, bx + 14, by + 19, 4, 2, "#1E2030");
    for (let i = 0; i < 3; i++) {
      const lit = (frame + i * 2) % 8 < 4;
      p(ctx, bx + 4 + i * 9, by + 5, 5, 5, lit ? "#F97316" : "#333");
      if (lit) p(ctx, bx + 4 + i * 9, by + 5, 2, 2, "#FFAA44");
    }
  } else if (state === "waiting") {
    p(ctx, bx + 2, by, 28, 16, "#1E2030");
    p(ctx, bx, by + 2, 32, 12, "#1E2030");
    p(ctx, bx + 2, by, 28, 1.5, "#EAB308");
    p(ctx, bx + 13, by + 16, 6, 3, "#1E2030");
    p(ctx, bx + 8, by + 3, 16, 2, "#EAB308");
    p(ctx, bx + 8, by + 12, 16, 2, "#EAB308");
    p(ctx, bx + 10, by + 5, 12, 2, frame % 8 < 4 ? "#EAB30855" : "#EAB308");
    p(ctx, bx + 13, by + 7, 6, 2, "#EAB308");
    p(ctx, bx + 10, by + 9.5, 12, 2, frame % 8 < 4 ? "#EAB308" : "#EAB30855");
  } else {
    const pr = frame % 24;
    ctx.fillStyle = "#8888AA55";
    ctx.font = "bold 16px monospace";
    if (pr < 8) ctx.fillText("z", bx + 22, by + 14);
    else if (pr < 16) {
      ctx.fillText("z", bx + 22, by + 14);
      ctx.font = "bold 12px monospace";
      ctx.fillText("z", bx + 30, by + 4);
    } else {
      ctx.fillText("z", bx + 22, by + 14);
      ctx.font = "bold 12px monospace";
      ctx.fillText("z", bx + 30, by + 4);
      ctx.font = "bold 9px monospace";
      ctx.fillText("z", bx + 37, by - 3);
    }
  }
}

function drawPlant(ctx: CanvasRenderingContext2D, c: number, r: number) {
  const { x, y } = iso(c, r);
  isoBox(ctx, x, y, 16, 12, 12, "#9B6040", "#805030", "#6A4028");
  isoBox(ctx, x, y - 12, 18, 13, 2, "#AA7050", "#905838", "#7A4830");
  p(ctx, x - 5, y - 16, 10, 3, "#3A2010");
  p(ctx, x - 4, y - 34, 9, 18, "#228B22");
  p(ctx, x - 9, y - 28, 7, 12, "#2E8B57");
  p(ctx, x + 3, y - 32, 8, 12, "#32CD32");
  p(ctx, x - 2, y - 38, 6, 8, "#2E8B57");
  p(ctx, x - 7, y - 24, 3, 3, "#50CC60");
  p(ctx, x + 6, y - 34, 3, 3, "#50CC60");
  p(ctx, x - 1, y - 20, 3, 6, "#4A3020");
}

function drawCooler(ctx: CanvasRenderingContext2D, c: number, r: number) {
  const { x, y } = iso(c, r);
  isoBox(ctx, x, y, 16, 12, 22, "#C0D0D8", "#A0B0B8", "#90A0A8");
  isoBox(ctx, x, y - 22, 14, 10, 22, "#B0D8F0", "#90B8D0", "#80A8C0");
  p(ctx, x - 5, y - 36, 10, 12, "#80C0E044");
  isoBox(ctx, x, y - 44, 16, 11, 2, "#D0E0E8", "#B0C0C8", "#A0B0B8");
  p(ctx, x - 6, y - 8, 5, 2.5, "#F97316");
  p(ctx, x + 2, y - 8, 5, 2.5, "#3B82F6");
}

function drawPanda(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number, dir: number) {
  const x = Math.round(cx),
    y = Math.round(cy);
  ctx.fillStyle = "#00000025";
  ctx.beginPath();
  ctx.ellipse(x, y + 3, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  const wb = Math.sin(frame * 0.6) * 1.5;
  const armSwing = Math.sin(frame * 0.6) * 3;
  p(ctx, x - 6, y - 1 + wb * 0.3, 5, 3, "#1A1A1A");
  p(ctx, x + 2, y - 1 - wb * 0.3, 5, 3, "#1A1A1A");
  p(ctx, x - 6, y - 1 + wb * 0.3, 5, 1, "#333");
  p(ctx, x + 2, y - 1 - wb * 0.3, 5, 1, "#333");
  p(ctx, x - 5, y - 6 + wb * 0.3, 4, 6, "#1A1A1A");
  p(ctx, x + 2, y - 6 - wb * 0.3, 4, 6, "#1A1A1A");
  p(ctx, x - 7, y - 20 + wb, 14, 15, "#F0F0F0");
  p(ctx, x + 5, y - 20 + wb, 2, 15, "#D8D8D8");
  p(ctx, x - 9, y - 19 + wb, 3, 12, "#1A1A1A");
  p(ctx, x + 6, y - 19 + wb, 3, 12, "#1A1A1A");
  p(ctx, x - 8, y - 20 + wb, 16, 2, "#1A1A1A");
  p(ctx, x - 3, y - 14 + wb, 6, 6, "#E0E0E0");
  p(ctx, x - 11, y - 18 + wb + armSwing, 4, 10, "#1A1A1A");
  p(ctx, x - 11, y - 18 + wb + armSwing, 1, 10, "#333");
  p(ctx, x + 7, y - 18 + wb - armSwing, 4, 10, "#1A1A1A");
  p(ctx, x + 10, y - 18 + wb - armSwing, 1, 10, "#333");
  p(ctx, x - 11, y - 9 + wb + armSwing, 4, 3, "#1A1A1A");
  p(ctx, x + 7, y - 9 + wb - armSwing, 4, 3, "#1A1A1A");
  p(ctx, x - 10, y - 36 + wb, 20, 18, "#F0F0F0");
  p(ctx, x + 8, y - 36 + wb, 2, 18, "#D8D8D8");
  p(ctx, x - 9, y - 37 + wb, 18, 2, "#F0F0F0");
  p(ctx, x - 10, y - 40 + wb, 6, 6, "#1A1A1A");
  p(ctx, x - 9, y - 39 + wb, 3, 3, "#333");
  p(ctx, x + 5, y - 40 + wb, 6, 6, "#1A1A1A");
  p(ctx, x + 6, y - 39 + wb, 3, 3, "#333");
  p(ctx, x - 8, y - 33 + wb, 7, 7, "#1A1A1A");
  p(ctx, x + 1, y - 33 + wb, 7, 7, "#1A1A1A");
  p(ctx, x - 6, y - 31 + wb, 4, 4, "#FFF");
  p(ctx, x + 3, y - 31 + wb, 4, 4, "#FFF");
  const px = dir > 0 ? 1 : dir < 0 ? -1 : 0;
  p(ctx, x - 5 + px, y - 30 + wb, 2, 3, "#1A1A2A");
  p(ctx, x + 4 + px, y - 30 + wb, 2, 3, "#1A1A2A");
  ctx.fillStyle = "#1A1A1A";
  p(ctx, x - 8, y - 35 + wb, 3, 2, "#1A1A1A");
  p(ctx, x - 6, y - 34 + wb, 3, 2, "#1A1A1A");
  p(ctx, x + 3, y - 34 + wb, 3, 2, "#1A1A1A");
  p(ctx, x + 5, y - 35 + wb, 3, 2, "#1A1A1A");
  p(ctx, x - 1, y - 26 + wb, 3, 2, "#1A1A1A");
  p(ctx, x - 3, y - 22 + wb, 7, 2, "#1A1A1A");
  p(ctx, x - 4, y - 23 + wb, 2, 1, "#1A1A1A");
  p(ctx, x + 3, y - 23 + wb, 2, 1, "#1A1A1A");
  p(ctx, x - 9, y - 26 + wb, 3, 2, "#FF6B6B44");
  p(ctx, x + 7, y - 26 + wb, 3, 2, "#FF6B6B44");
  const emotePhase = Math.floor(frame / 12) % 4;
  if (emotePhase < 3) {
    p(ctx, x + 6, y - 50 + wb, 14, 12, "#1E2030");
    p(ctx, x + 5, y - 49 + wb, 16, 10, "#1E2030");
    p(ctx, x + 5, y - 50 + wb, 16, 1.5, "#FF4444");
    p(ctx, x + 11, y - 38 + wb, 4, 3, "#1E2030");
    ctx.fillStyle = "#FF4444";
    ctx.font = "bold 10px 'Courier New',monospace";
    ctx.textAlign = "center";
    if (emotePhase === 0) ctx.fillText("!", x + 13, y - 40 + wb);
    else if (emotePhase === 1) ctx.fillText("#", x + 13, y - 40 + wb);
    else ctx.fillText("※", x + 13, y - 40 + wb);
  }
  p(ctx, x - 16, y + 4, 32, 11, "#0A0A12CC");
  ctx.fillStyle = "#FF4444";
  ctx.font = "bold 8px 'Courier New',monospace";
  ctx.textAlign = "center";
  ctx.fillText("PETER", x, y + 12);
}

interface Props {
  agents: AgentData[];
}

export default function AgentOffice({ agents }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const [states, setStates] = useState<Record<string, "working" | "waiting" | "idle">>({});
  const [hovered, setHovered] = useState<AgentDisplay | null>(null);
  const [mPos, setMPos] = useState({ x: 0, y: 0 });

  const pandaRef = useRef({
    col: 5,
    row: 5,
    targetCol: 8,
    targetRow: 3,
    speed: 0.04,
    waitFrames: 0,
    dir: 1,
  });

  // Initialize states from props
  useEffect(() => {
    const newStates: Record<string, "working" | "waiting" | "idle"> = {};
    agents.forEach((a) => {
      newStates[a.id] = a.activity;
    });
    setStates(newStates);
  }, [agents]);

  // Initialize background
  useEffect(() => {
    const off = document.createElement("canvas");
    off.width = CW;
    off.height = CH;
    const c = off.getContext("2d")!;
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#0A0A12";
    c.fillRect(0, 0, CW, CH);
    drawFloor(c);
    drawRug(c);
    drawWalls(c);
    drawLongDesk(c, 0.8, 8, DESK1.row);
    drawLongDesk(c, 0.8, 8, DESK2.row);
    drawPlant(c, 0.3, 0.3);
    drawPlant(c, 0.3, 3.5);
    drawPlant(c, 0.3, 7);
    drawPlant(c, 0.3, 9.5);
    drawPlant(c, 11.5, 0.3);
    drawCooler(c, 0.5, 9);
    bgRef.current = off;
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      if (!bgRef.current) return;
      ctx.clearRect(0, 0, CW, CH);
      ctx.drawImage(bgRef.current, 0, 0);
      drawSofa(ctx);

      const entities: Array<{ y: number; draw: () => void }> = [];
      let idleIdx = 0;

      const sofaSeats = [
        { col: 7.0, row: 1.4 },
        { col: 7.8, row: 1.4 },
        { col: 8.6, row: 1.4 },
        { col: 9.4, row: 1.4 },
        { col: 10.1, row: 1.4 },
        { col: 10.8, row: 1.3 },
        { col: 10.8, row: 2.0 },
        { col: 10.8, row: 2.7 },
        { col: 10.8, row: 3.3 },
        { col: 7.4, row: 1.4 },
        { col: 8.2, row: 1.4 },
        { col: 9.0, row: 1.4 },
      ];

      AGENTS.forEach((agent, i) => {
        const st = states[agent.id];
        const station = STATIONS[i];
        const agentPos = iso(station.col, station.seatRow);

        if (st === "idle") {
          const seat = sofaSeats[idleIdx % sofaSeats.length];
          const sp = iso(seat.col, seat.row);
          entities.push({
            y: sp.y + 20,
            draw: () => {
              drawCharSofa(ctx, sp.x, sp.y, agent, frame);
              drawBub(ctx, sp.x, sp.y, "idle", frame);
            },
          });
          idleIdx++;
        } else {
          entities.push({
            y: agentPos.y,
            draw: () => {
              drawMonitor(ctx, station.col, station.deskRow, st === "working", frame);
              drawChar(ctx, agentPos.x, agentPos.y + 18, agent, st, frame);
              drawBub(ctx, agentPos.x, agentPos.y + 18, st, frame);
            },
          });
        }
      });

      const pd = pandaRef.current;
      if (pd.waitFrames > 0) {
        pd.waitFrames--;
        if (pd.waitFrames === 0) {
          pd.targetCol = 1 + Math.random() * 10;
          pd.targetRow = 1 + Math.random() * 8;
        }
      } else {
        const dx = pd.targetCol - pd.col;
        const dy = pd.targetRow - pd.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.15) {
          pd.waitFrames = 30 + Math.floor(Math.random() * 60);
        } else {
          pd.col += (dx / dist) * pd.speed;
          pd.row += (dy / dist) * pd.speed;
          pd.dir = dx > 0.1 ? 1 : dx < -0.1 ? -1 : pd.dir;
        }
      }

      const pp = iso(pd.col, pd.row);
      entities.push({
        y: pp.y,
        draw: () => drawPanda(ctx, pp.x, pp.y, pd.waitFrames > 0 ? 0 : frame, pd.dir),
      });

      entities.sort((a, b) => a.y - b.y);
      entities.forEach((e) => e.draw());

      AGENTS.forEach((a, i) => {
        if (states[a.id] !== "idle") {
          const s = STATIONS[i];
          const dp = iso(s.col, s.deskRow);
          p(ctx, dp.x - 20, dp.y + 2, 40, 12, "#0A0A12CC");
          ctx.fillStyle = a.color;
          ctx.font = "bold 8px 'Courier New',monospace";
          ctx.textAlign = "center";
          ctx.fillText(a.name.toUpperCase(), dp.x, dp.y + 11);
        }
      });

      ctx.fillStyle = "#F97316";
      ctx.font = "bold 18px 'Courier New',monospace";
      ctx.textAlign = "left";
      ctx.fillText("MISSION CONTROL", 18, 28);
      ctx.fillStyle = "#6A7A88";
      ctx.font = "10px 'Courier New',monospace";
      ctx.fillText("Agent Operations Center", 18, 42);
      const now = new Date();
      ctx.fillStyle = "#F97316";
      ctx.font = "bold 16px 'Courier New',monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
        CW - 18,
        28
      );
      ctx.fillStyle = "#556";
      ctx.font = "9px 'Courier New',monospace";
      ctx.fillText("● LIVE", CW - 18, 40);
    },
    [states]
  );

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    let id: number;
    let lt = 0;
    function loop(t: number) {
      id = requestAnimationFrame(loop);
      if (t - lt < 125) return;
      lt = t;
      frameRef.current++;
      draw(ctx, frameRef.current);
    }
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rc = canvasRef.current?.getBoundingClientRect();
    if (!rc) return;
    setMPos({ x: e.clientX - rc.left, y: e.clientY - rc.top });
    const mx = ((e.clientX - rc.left) * CW) / rc.width;
    const my = ((e.clientY - rc.top) * CH) / rc.height;
    let f: AgentDisplay | null = null;
    AGENTS.forEach((a, i) => {
      const s = STATIONS[i];
      const dp = iso(s.col, s.seatRow);
      if (Math.abs(mx - dp.x) < 35 && Math.abs(my - dp.y) < 50) f = a;
    });
    setHovered(f);
  };

  const cnt = { working: 0, waiting: 0, idle: 0 };
  Object.values(states).forEach((s) => {
    cnt[s as keyof typeof cnt]++;
  });

  return (
    <div style={{ background: "#0A0A12", minHeight: "100vh", color: "#E5E5E5", fontFamily: "'Courier New',monospace" }}>
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "2px solid #F97316",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(180deg,#14141E,#0A0A12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#F97316", fontWeight: "bold", fontSize: 18, letterSpacing: 2 }}>ISTK</span>
          <span style={{ color: "#333" }}>│</span>
          <span style={{ color: "#7A8A98", fontSize: 13, letterSpacing: 1 }}>AGENT OPERATIONS CENTER</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 12 }}>
          {[
            { l: "ACTIVE", n: cnt.working, c: "#10B981" },
            { l: "STANDBY", n: cnt.waiting, c: "#EAB308" },
            { l: "IDLE", n: cnt.idle, c: "#556" },
          ].map((s) => (
            <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: s.c,
                  boxShadow: s.c !== "#556" ? `0 0 8px ${s.c}` : "none",
                }}
              />
              <span style={{ color: s.c, letterSpacing: 1 }}>
                {s.n} {s.l}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "relative", padding: "8px 16px", display: "flex", justifyContent: "center" }}>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          onMouseMove={onMove}
          style={{
            width: "100%",
            maxWidth: 1400,
            imageRendering: "pixelated",
            borderRadius: 8,
            border: "1px solid #1A1A24",
            cursor: hovered ? "pointer" : "default",
            boxShadow: "0 4px 40px rgba(0,0,0,0.5)",
          }}
        />
        {hovered && (
          <div
            style={{
              position: "absolute",
              left: Math.min(mPos.x + 30, typeof window !== "undefined" ? window.innerWidth - 280 : 900),
              top: mPos.y,
              background: "#12121EEE",
              border: `1px solid ${hovered.color}`,
              padding: "12px 16px",
              borderRadius: 8,
              fontSize: 13,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div style={{ color: hovered.color, fontWeight: "bold", fontSize: 15 }}>
              {hovered.emoji} {hovered.name}
            </div>
            <div style={{ color: "#7A8A98", marginTop: 3 }}>{hovered.role}</div>
            <div
              style={{
                color:
                  states[hovered.id] === "working"
                    ? "#10B981"
                    : states[hovered.id] === "waiting"
                      ? "#EAB308"
                      : "#556",
                marginTop: 8,
                textTransform: "uppercase",
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              {states[hovered.id] === "working"
                ? "⚙ Processing task..."
                : states[hovered.id] === "waiting"
                  ? "⏳ Awaiting assignment"
                  : "💤 Off duty"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
