```javascript
// Global State
let rawLoadedRows = [];
let lastGeneratedRows = [];
let currentGenderMode = "alt_bench";

// Demo Student Data for instant testing
const DEMO_STUDENTS = [
    { "Roll No": 101, "Student Name": "आदित्य कुमार", "Address": "नरहट", "Gender": "Male" },
    { "Roll No": 102, "Student Name": "प्रिया कुमारी", "Address": "चाँदनी चौक", "Gender": "Female" },
    { "Roll No": 103, "Student Name": "रोहित राज", "Address": "ओलीपुर", "Gender": "Male" },
    { "Roll No": 104, "Student Name": "अंजलि कुमारी", "Address": "हिसुआ", "Gender": "Female" },
    { "Roll No": 105, "Student Name": "सौरभ कुमार", "Address": "नरहट", "Gender": "Male" },
    { "Roll No": 106, "Student Name": "नेहा कुमारी", "Address": "खानपुर", "Gender": "Female" },
    { "Roll No": 107, "Student Name": "अमन कुमार", "Address": "चाँदनी चौक", "Gender": "Male" },
    { "Roll No": 108, "Student Name": "पूजा कुमारी", "Address": "ओलीपुर", "Gender": "Female" },
    { "Roll No": 109, "Student Name": "विकास कुमार", "Address": "नरहट", "Gender": "Male" },
    { "Roll No": 110, "Student Name": "काजल कुमारी", "Address": "सैदपुर", "Gender": "Female" },
    { "Roll No": 111, "Student Name": "राहुल कुमार", "Address": "हिसुआ", "Gender": "Male" },
    { "Roll No": 112, "Student Name": "साक्षी कुमारी", "Address": "नरहट", "Gender": "Female" },
    { "Roll No": 113, "Student Name": "नीरज कुमार", "Address": "चाँदनी चौक", "Gender": "Male" },
    { "Roll No": 114, "Student Name": "रिया कुमारी", "Address": "ओलीपुर", "Gender": "Female" },
    { "Roll No": 115, "Student Name": "दीपक कुमार", "Address": "खानपुर", "Gender": "Male" },
    { "Roll No": 116, "Student Name": "मुस्कान कुमारी", "Address": "नरहट", "Gender": "Female" },
    { "Roll No": 117, "Student Name": "कुंदन कुमार", "Address": "सैदपुर", "Gender": "Male" },
    { "Roll No": 118, "Student Name": "निधि कुमारी", "Address": "चाँदनी चौक", "Gender": "Female" },
    { "Roll No": 119, "Student Name": "सोनू कुमार", "Address": "ओलीपुर", "Gender": "Male" },
    { "Roll No": 120, "Student Name": "स्वाति कुमारी", "Address": "नरहट", "Gender": "Female" },
    { "Roll No": 121, "Student Name": "अभिषेक कुमार", "Address": "हिसुआ", "Gender": "Male" },
    { "Roll No": 122, "Student Name": "कोमल कुमारी", "Address": "खानपुर", "Gender": "Female" },
    { "Roll No": 123, "Student Name": "मनीष कुमार", "Address": "चाँदनी चौक", "Gender": "Male" },
    { "Roll No": 124, "Student Name": "सोनी कुमारी", "Address": "नरहट", "Gender": "Female" },
    { "Roll No": 125, "Student Name": "पंकज कुमार", "Address": "ओलीपुर", "Gender": "Male" },
    { "Roll No": 126, "Student Name": "आरती कुमारी", "Address": "सैदपुर", "Gender": "Female" },
    { "Roll No": 127, "Student Name": "गौरव कुमार", "Address": "नरहट", "Gender": "Male" },
    { "Roll No": 128, "Student Name": "दिव्या कुमारी", "Address": "चाँदनी चौक", "Gender": "Female" },
    { "Roll No": 129, "Student Name": "हर्ष कुमार", "Address": "ओलीपुर", "Gender": "Male" },
    { "Roll No": 130, "Student Name": "पल्लवी कुमारी", "Address": "नरहट", "Gender": "Female" }
];

function setStatus(message, colorHex) {
    const statusText = document.getElementById('statusText');
    statusText.innerHTML = message;
    statusText.style.color = colorHex || "#cbd5e1";
}

function normalizeGender(val) {
    const g = (val || "").toString().trim().toLowerCase();
    if (g.startsWith('f') || g === 'girl' || g === 'girls' || g.includes('महिला') || g.includes('लड़की')) {
        return "Female";
    }
    return "Male";
}

function renderBenchDiagram() {
    const container = document.getElementById('liveBenchDiagram');
    const explainEl = document.getElementById('figureRuleExplain');
    if (!container || !explainEl) return;

    const benchSize = parseInt(document.getElementById('benchSizeSelect').value, 10) || 3;
    const seatRule = document.getElementById('seatRuleSelect').value;
    const firstTurn = document.getElementById('firstTurnSelect').value;

    let seatCounter = 0;
    let cornerIndex = 0;

    function nextSeatWithSkips(bNum, sPos) {
        if (seatRule === "benchCode") return { seat: "B" + bNum + "-" + sPos, skipped: [] };
        if (seatRule === "corner14") {
            const pairIdx = Math.floor(cornerIndex / 2);
            const isSecond = (cornerIndex % 2 === 1);
            cornerIndex++;
            if (isSecond) {
                const s1 = pairIdx * 4 + 2;
                const s2 = pairIdx * 4 + 3;
                return { seat: pairIdx * 4 + 4, skipped: [s1 + "-" + s2] };
            } else {
                return { seat: pairIdx * 4 + 1, skipped: [] };
            }
        }
        let skippedList = [];
        seatCounter++;
        if (seatRule === "skip4" && seatCounter % 4 === 0) {
            skippedList.push(seatCounter);
            seatCounter++;
        }
        return { seat: seatCounter, skipped: skippedList };
    }

    const startWithGirls = (firstTurn === "girls");
    let explainText = "";
    if (currentGenderMode === "alt_bench") {
        explainText = `बेंच 1 पर ${benchSize} ${startWithGirls ? 'लड़कियाँ' : 'लड़के'}, बेंच 2 पर ${benchSize} ${startWithGirls ? 'लड़के' : 'लड़कियाँ'} (बारी-बारी)`;
    } else if (currentGenderMode === "mix_random") {
        explainText = `हर बेंच पर ${benchSize} स्टूडेंट्स (लड़के और लड़कियाँ रैंडम मिक्स)`;
    } else if (currentGenderMode === "mix_alt_seat") {
        explainText = `एक ही बेंच पर बारी-बारी 1 लड़का और 1 लड़की (${benchSize} सीट/बेंच)`;
    } else if (currentGenderMode === "separate_blocks") {
        explainText = `पहले ${startWithGirls ? 'सभी लड़कियों' : 'सभी लड़कों'} की बेंचें, फिर ${startWithGirls ? 'लड़कों' : 'लड़कियों'} की बेंचें`;
    } else if (currentGenderMode === "only_boys") {
        explainText = `हर बेंच पर सिर्फ लड़के (${benchSize} Boys / Bench)`;
    } else if (currentGenderMode === "only_girls") {
        explainText = `हर बेंच पर सिर्फ लड़कियाँ (${benchSize} Girls / Bench)`;
    }
    explainEl.innerText = explainText;

    let html = "";
    let altSeatTurnMale = !startWithGirls;
    const mixSamplePattern = ["Male", "Female", "Male", "Female", "Female", "Male", "Female", "Male", "Male"];
    let mixPtr = 0;

    for (let b = 1; b <= 3; b++) {
        let benchTitle = "बेंच नं. " + b + " (Bench-" + b + ")";
        let seatsHtml = "";

        for (let pos = 1; pos <= benchSize; pos++) {
            let g = "Male";
            if (currentGenderMode === "only_boys") {
                g = "Male";
            } else if (currentGenderMode === "only_girls") {
                g = "Female";
            } else if (currentGenderMode === "alt_bench") {
                const isOddBench = (b % 2 === 1);
                if (startWithGirls) {
                    g = isOddBench ? "Female" : "Male";
                } else {
                    g = isOddBench ? "Male" : "Female";
                }
            } else if (currentGenderMode === "separate_blocks") {
                if (startWithGirls) {
                    g = (b <= 2) ? "Female" : "Male";
                } else {
                    g = (b <= 2) ? "Male" : "Female";
                }
            } else if (currentGenderMode === "mix_alt_seat") {
                g = altSeatTurnMale ? "Male" : "Female";
                altSeatTurnMale = !altSeatTurnMale;
            } else {
                g = mixSamplePattern[mixPtr % mixSamplePattern.length];
                mixPtr++;
            }

            const seatObj = nextSeatWithSkips(b, pos);
            seatObj.skipped.forEach(sk => {
                seatsHtml += `
                    <div class="min-w-[48px] border border-dashed border-red-500/50 bg-red-950/30 rounded-lg p-1 text-center flex flex-col justify-center items-center opacity-85" title="बीच की खाली सीट">
                        <div class="text-xs">🚫</div>
                        <div class="text-[9px] text-red-300 font-bold">Seat ${sk}</div>
                        <div class="text-[8px] text-red-400">Skip</div>
                    </div>
                `;
            });

            const sNo = seatObj.seat;
            const isGirl = (g === "Female");
            const bg = isGirl ? "bg-pink-950/80 border-pink-500/50 text-pink-200" : "bg-blue-950/80 border-blue-500/50 text-blue-200";
            const icon = isGirl ? "👧" : "👦";
            const label = isGirl ? "Girl" : "Boy";

            seatsHtml += `
                <div class="flex-1 min-w-[54px] border ${bg} rounded-lg p-1.5 text-center shadow-sm">
                    <div class="text-base leading-none mb-0.5">${icon}</div>
                    <div class="text-[10px] font-bold">${label}</div>
                    <div class="text-[10px] bg-slate-900/90 text-cyan-300 rounded px-1 py-0.5 mt-1 font-mono font-bold">Seat ${sNo}</div>
                </div>
            `;
        }

        if (seatRule === "skip4" && (seatCounter + 1) % 4 === 0) {
            seatCounter++;
            seatsHtml += `
                <div class="min-w-[46px] border border-dashed border-red-500/50 bg-red-950/30 rounded-lg p-1 text-center flex flex-col justify-center items-center opacity-85" title="4 का गुणज हटाया गया">
                    <div class="text-xs">🚫</div>
                    <div class="text-[9px] text-red-300 font-bold">Seat ${seatCounter}</div>
                    <div class="text-[8px] text-red-400">Skip</div>
                </div>
            `;
        } else if (seatRule === "skipAfterBench") {
            seatCounter++;
            seatsHtml += `
                <div class="min-w-[48px] border border-dashed border-amber-500/40 bg-amber-950/20 rounded-lg p-1 text-center flex flex-col justify-center items-center opacity-75">
                    <div class="text-xs">⏭️</div>
                    <div class="text-[9px] text-amber-300 font-semibold">Seat ${seatCounter}</div>
                    <div class="text-[9px] text-amber-400">Gap</div>
                </div>
            `;
        }

        html += `
            <div class="bg-slate-900/90 border-2 border-slate-700 rounded-xl p-2.5 flex flex-col justify-between">
                <div class="text-[11px] font-bold text-slate-300 mb-2 text-center border-b border-slate-800 pb-1">
                    🪑 ${benchTitle}
                </div>
                <div class="flex items-stretch justify-center gap-1.5 flex-wrap">
                    ${seatsHtml}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function updateSummaryBadges() {
    renderBenchDiagram();
    const benchSize = parseInt(document.getElementById('benchSizeSelect').value, 10) || 3;
    const rowsPerPage = parseInt(document.getElementById('rowsPerPageSelect').value, 10) || 28;
    const seatRule = document.getElementById('seatRuleSelect').value;

    document.getElementById('pillSeatsPerPage').innerText = rowsPerPage + " Seats / Page";
    document.getElementById('pillBenchCount').innerText = benchSize + (benchSize === 1 ? " Student / Bench" : " Students / Bench");

    const modeLabels = {
        "alt_bench": "1 Bench Boys / 1 Bench Girls",
        "mix_random": "Boys + Girls Random Mix",
        "mix_alt_seat": "1 Boy - 1 Girl Alternate",
        "separate_blocks": "Separate Girls & Boys Blocks",
        "only_boys": "Only Boys Seating",
        "only_girls": "Only Girls Seating"
    };
    document.getElementById('pillGenderMode').innerText = modeLabels[currentGenderMode] || "Custom Mode";

    const ruleLabels = {
        "skip4": "4 के गुणज हटाएँ (1, 2, 3, 5, 6, 7...)",
        "corner14": "पैटर्न: 1, 4 | 5, 8 | 9, 12...",
        "sequential": "लगातार सीट (1, 2, 3, 4...)",
        "skipAfterBench": "हर बेंच के बाद 1 सीट गैप",
        "benchCode": "Bench Code (B1-1, B1-2)"
    };
    document.getElementById('pillSeatRule').innerText = ruleLabels[seatRule] || "Sequential";

    if (rawLoadedRows.length > 0) {
        const headers = Object.keys(rawLoadedRows[0]);
        const genderKey = headers.find(h => h.toLowerCase().includes('gender') || h.toLowerCase() === 'sex');
        let boys = 0;
        let girls = 0;
        rawLoadedRows.forEach(r => {
            if (genderKey && normalizeGender(r[genderKey]) === "Female") {
                girls++;
            } else {
                boys++;
            }
        });

        let activeStudents = rawLoadedRows.length;
        if (currentGenderMode === "only_boys") activeStudents = boys;
        if (currentGenderMode === "only_girls") activeStudents = girls;

        const estBenches = Math.ceil(activeStudents / benchSize);
        const estPages = Math.max(1, Math.ceil(activeStudents / rowsPerPage));

        document.getElementById('fileStatsBar').classList.remove('hidden');
        document.getElementById('statTotal').innerText = rawLoadedRows.length + " (Active: " + activeStudents + ")";
        document.getElementById('statBoys').innerText = boys;
        document.getElementById('statGirls').innerText = girls;
        document.getElementById('statBenchesPages').innerText = estBenches + " Benches / " + estPages + " Page";
    }
}

function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function sortOrShuffleList(list, orderMode) {
    const copy = [...list];
    if (orderMode === "shuffle") {
        return shuffleArray(copy);
    } else if (orderMode === "roll") {
        return copy.sort((a, b) => {
            const numA = parseFloat(a.roll) || 0;
            const numB = parseFloat(b.roll) || 0;
            if (numA !== numB) return numA - numB;
            return String(a.roll).localeCompare(String(b.roll));
        });
    } else if (orderMode === "name") {
        return copy.sort((a, b) => String(a.name).localeCompare(String(b.name), 'hi'));
    }
    return copy;
}

function checkPasswordAccess() {
    const passInput = document.getElementById('passwordInput');
    const val = (passInput.value || "").trim();
    if (val !== "Dhruv@12345") {
        setStatus("⚠️ Access Denied: कृपया सही पासवर्ड डालें! (पासवर्ड बॉक्स में पासवर्ड भरें)", "#f87171");
        passInput.focus();
        passInput.classList.add('border-red-500');
        setTimeout(() => passInput.classList.remove('border-red-500'), 2000);
        return false;
    }
    return true;
}

function buildSeatingAllocation() {
    if (rawLoadedRows.length === 0) {
        setStatus("⚠️ कृपया पहले Student CSV/Excel फाइल चुनें या 'Demo Students लोड करें' पर क्लिक करें।", "#f87171");
        return null;
    }

    const headers = Object.keys(rawLoadedRows[0]);
    const rollNoKey = headers.find(h => h.toLowerCase().includes('roll')) || headers[0];
    const nameKey = headers.find(h => h.toLowerCase().includes('name')) || headers[1];
    const addressKey = headers.find(h =>
        h.toLowerCase().includes('address') ||
        h.toLowerCase().includes('village') ||
        h.toLowerCase().includes('city') ||
        h.toLowerCase().includes('pata') ||
        h.toLowerCase().includes('add')
    ) || headers[2];
    const genderKey = headers.find(h => h.toLowerCase().includes('gender') || h.toLowerCase() === 'sex');

    if (!genderKey) {
        setStatus("⚠️ Error: आपकी फाइल में 'Gender' (Male/Female) का कॉलम नहीं मिला!", "#f87171");
        return null;
    }

    const benchSize = parseInt(document.getElementById('benchSizeSelect').value, 10) || 3;
    const seatRule = document.getElementById('seatRuleSelect').value;
    const firstTurn = document.getElementById('firstTurnSelect').value;
    const orderMode = document.getElementById('orderModeSelect').value;

    let allNormalized = rawLoadedRows.map(row => ({
        roll: row[rollNoKey] !== undefined ? row[rollNoKey] : "-",
        name: row[nameKey] !== undefined ? row[nameKey] : "-",
        address: (addressKey && addressKey !== genderKey && row[addressKey] !== undefined) ? row[addressKey] : "-",
        gender: normalizeGender(row[genderKey])
    }));

    let males = allNormalized.filter(s => s.gender === "Male");
    let females = allNormalized.filter(s => s.gender === "Female");

    males = sortOrShuffleList(males, orderMode);
    females = sortOrShuffleList(females, orderMode);

    // Seat Number Generator (Supports skip4, corner14: 1,4,5,8,9,12..., sequential, skipAfterBench, benchCode)
    let seatCounter = 0;
    let cornerStudentIdx = 0;

    function getNextSeatNumber(benchNumber, posInBench) {
        if (seatRule === "benchCode") {
            return "B" + benchNumber + "-" + posInBench;
        }
        if (seatRule === "corner14") {
            const pairIdx = Math.floor(cornerStudentIdx / 2);
            const isSecond = (cornerStudentIdx % 2 === 1);
            cornerStudentIdx++;
            return isSecond ? (pairIdx * 4 + 4) : (pairIdx * 4 + 1);
        }
        seatCounter++;
        if (seatRule === "skip4" && seatCounter % 4 === 0) {
            seatCounter++; // 4 के गुणज (4, 8, 12, 16...) को हटा देगा
        }
        return seatCounter;
    }

    let benches = []; // Array of benches; each bench is an array of student objects

    if (currentGenderMode === "only_boys") {
        let idx = 0;
        while (idx < males.length) {
            benches.push(males.slice(idx, idx + benchSize));
            idx += benchSize;
        }
    } else if (currentGenderMode === "only_girls") {
        let idx = 0;
        while (idx < females.length) {
            benches.push(females.slice(idx, idx + benchSize));
            idx += benchSize;
        }
    } else if (currentGenderMode === "mix_random") {
        let combined = sortOrShuffleList(allNormalized, orderMode);
        let idx = 0;
        while (idx < combined.length) {
            benches.push(combined.slice(idx, idx + benchSize));
            idx += benchSize;
        }
    } else if (currentGenderMode === "mix_alt_seat") {
        let mIdx = 0, fIdx = 0;
        let maleTurn = firstTurn === "boys" ? true : (firstTurn === "girls" ? false : (Math.random() < 0.5));
        let combinedSeats = [];
        while (mIdx < males.length || fIdx < females.length) {
            if (maleTurn && mIdx < males.length) {
                combinedSeats.push(males[mIdx++]);
            } else if (!maleTurn && fIdx < females.length) {
                combinedSeats.push(females[fIdx++]);
            } else if (mIdx < males.length) {
                combinedSeats.push(males[mIdx++]);
            } else if (fIdx < females.length) {
                combinedSeats.push(females[fIdx++]);
            }
            maleTurn = !maleTurn;
        }
        let idx = 0;
        while (idx < combinedSeats.length) {
            benches.push(combinedSeats.slice(idx, idx + benchSize));
            idx += benchSize;
        }
    } else if (currentGenderMode === "separate_blocks") {
        let boysFirst = firstTurn === "boys" ? true : (firstTurn === "girls" ? false : (Math.random() < 0.5));
        const firstGroup = boysFirst ? males : females;
        const secondGroup = boysFirst ? females : males;

        for (let i = 0; i < firstGroup.length; i += benchSize) {
            benches.push(firstGroup.slice(i, i + benchSize));
        }
        for (let i = 0; i < secondGroup.length; i += benchSize) {
            benches.push(secondGroup.slice(i, i + benchSize));
        }
    } else {
        // Default: "alt_bench" (1 Bench Boys, 1 Bench Girls alternating)
        let mIdx = 0, fIdx = 0;
        let isMaleTurn = firstTurn === "boys" ? true : (firstTurn === "girls" ? false : (Math.random() < 0.5));

        while (mIdx < males.length || fIdx < females.length) {
            if (isMaleTurn && mIdx >= males.length) {
                isMaleTurn = false;
            } else if (!isMaleTurn && fIdx >= females.length) {
                isMaleTurn = true;
            }

            let currentBench = [];
            if (isMaleTurn) {
                while (mIdx < males.length && currentBench.length < benchSize) {
                    currentBench.push(males[mIdx++]);
                }
            } else {
                while (fIdx < females.length && currentBench.length < benchSize) {
                    currentBench.push(females[fIdx++]);
                }
            }

            if (currentBench.length > 0) {
                benches.push(currentBench);
                isMaleTurn = !isMaleTurn;
            }
        }
    }

    // Convert benches into final flat rows with Bench No. and Seat No.
    let finalRows = [];
    benches.forEach((benchStudents, bIndex) => {
        const benchNumber = bIndex + 1;
        benchStudents.forEach((st, sIndex) => {
            const seatNo = getNextSeatNumber(benchNumber, sIndex + 1);
            finalRows.push({
                roll: st.roll,
                name: st.name,
                address: st.address,
                benchNo: "Bench-" + benchNumber,
                seatNo: seatNo,
                gender: st.gender
            });
        });
        if (seatRule === "skipAfterBench") {
            seatCounter++; // Leave 1 empty seat number after every bench
        }
    });

    lastGeneratedRows = finalRows;
    return finalRows;
}

function renderLivePreview(rows) {
    const previewSection = document.getElementById('livePreviewSection');
    const tbody = document.getElementById('previewTableBody');
    const badge = document.getElementById('previewCountBadge');

    previewSection.classList.remove('hidden');
    badge.innerText = rows.length + " Students Allotted";
    tbody.innerHTML = "";

    rows.forEach((r, idx) => {
        const tr = document.createElement('tr');
        tr.className = idx % 2 === 0 ? "bg-slate-900/60" : "bg-slate-800/40";
        const genderBadge = r.gender === "Female"
            ? `<span class="text-pink-300 font-semibold">Female</span>`
            : `<span class="text-blue-300 font-semibold">Male</span>`;

        tr.innerHTML = `
            <td class="p-2 border border-slate-800 font-bold text-slate-200">${r.roll}</td>
            <td class="p-2 border border-slate-800 font-bold text-white">${r.name}</td>
            <td class="p-2 border border-slate-800 text-slate-300">${r.address}</td>
            <td class="p-2 border border-slate-800 text-amber-300 font-semibold">${r.benchNo}</td>
            <td class="p-2 border border-slate-800 font-bold text-cyan-300">${r.seatNo}</td>
            <td class="p-2 border border-slate-800">${genderBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

function chunkArray(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}

function generatePDF(allData) {
    setStatus("⏳ PDF बन रही है, कृपया प्रतीक्षा करें...", "#38bdf8");

    const logoSrc = document.getElementById('coachingLogo').src;
    const rowsPerPage = parseInt(document.getElementById('rowsPerPageSelect').value, 10) || 28;
    const showBenchCol = document.getElementById('chkShowBenchCol').checked;
    const showSignCol = document.getElementById('chkShowSignCol').checked;
    const examSubtitle = (document.getElementById('examSubtitleInput').value || "").trim();

    // Calculate exact table height so every full page stretches to the bottom of A4 without any extra blank space
    const fullPageTableHeightPx = examSubtitle ? 890 : 908;
    const partialRowHeightPx = Math.floor(fullPageTableHeightPx / rowsPerPage);
    const cellFontSize = rowsPerPage <= 26 ? 14.5 : (rowsPerPage <= 28 ? 14 : 13.2);
    const cellPadY = 4;

    const pages = chunkArray(allData, rowsPerPage);
    let htmlContent = `<div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #000000; width: 750px; background: #ffffff; margin: 0; padding: 0;">`;

    pages.forEach((pageData, pageIndex) => {
        const pageClass = pageIndex > 0 ? 'page-break' : '';
        const isFullPage = pageData.length === rowsPerPage;
        const pageHeightStyle = (pageIndex < pages.length - 1 || isFullPage) ? 'height: 1072px;' : 'padding-bottom: 6px;';
        const tableHeightStyle = isFullPage ? `height: ${fullPageTableHeightPx}px;` : '';
        const trHeightStyle = isFullPage ? '' : `height: ${partialRowHeightPx}px;`;

        htmlContent += `<div class="${pageClass}" style="box-sizing: border-box; width: 750px; ${pageHeightStyle} padding: 3px 10px 3px 10px; background: #ffffff; page-break-inside: avoid; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">`;

        htmlContent += `<div style="width: 100%;">`;

        // Exact Official Coaching Header
        htmlContent += `
            <div style="border: 2px solid #000000; background: #ffffff; margin-bottom: 6px; box-sizing: border-box; width: 100%;">
                <div style="display: flex; align-items: center; padding: 5px 14px 5px 10px; border-bottom: 2px solid #000000; box-sizing: border-box;">
                    <div style="width: 102px; height: 102px; flex-shrink: 0; margin-right: 14px; display: flex; align-items: center; justify-content: center;">
                        <img src="${logoSrc}" style="width: 102px; height: 102px; object-fit: contain; border-radius: 50%; display: block;">
                    </div>
                    <div style="flex: 1; color: #000000; box-sizing: border-box; padding-right: 6px;">
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 2px;">
                            <tr>
                                <td style="text-align: left; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; font-weight: bold; color: #000000; padding: 0;">
                                    शून्य से शिखर तक....
                                </td>
                                <td style="text-align: right; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold; color: #000000; padding: 0 4px 0 0; white-space: nowrap;">
                                    Mobile No :- 8210473227,7050692375.
                                </td>
                            </tr>
                        </table>
                        <div style="text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 35px; font-weight: bold; color: #000000; line-height: 1.16; margin: 2px 0; word-spacing: 3px;">
                            सफलता एक्सप्रेस कोचिंग सेंटर
                        </div>
                        <div style="text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16.5px; font-weight: bold; color: #000000; line-height: 1.25; margin-top: 2px;">
                            ओलीपुर रोड ,स्टेट बैंक के निकट ,नजदीकी मार्केट -चाँदनी चौक ,नरहट
                        </div>
                        <div style="text-align: center; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; font-weight: bold; color: #000000; line-height: 1.22; margin-top: 2px;">
                            For &nbsp;Class :- &nbsp;1 to 12<sup style="font-size: 11px;">th</sup> &nbsp;(Science &amp; &nbsp;Art's )
                        </div>
                    </div>
                </div>
                ${examSubtitle ? `<div style="text-align: center; font-size: 13px; font-weight: bold; color: #1e3a8a; background: #eff6ff; padding: 3px 8px; border-bottom: 1.5px solid #000000;">${examSubtitle}</div>` : `<div style="height: 3px; background: #ffffff;"></div>`}
            </div>
        `;

        // Table Structure with Dark & High-Contrast Horizontal + Vertical Grid Lines
        htmlContent += `
            <table style="width: 100%; ${tableHeightStyle} border-collapse: collapse; border: 2px solid #000000; font-size: ${cellFontSize}px; text-align: center;">
                <thead>
                    <tr style="background-color: #1e40af; color: #ffffff; height: 34px;">
                        <th style="padding: 6px; border: 1.5px solid #000000; width: 14%; text-align: center; font-weight: 800; letter-spacing: 0.3px;">Roll No.</th>
                        <th style="padding: 6px; border: 1.5px solid #000000; width: ${showBenchCol || showSignCol ? '26%' : '32%'}; text-align: center; font-weight: 800; letter-spacing: 0.3px;">Student Name</th>
                        <th style="padding: 6px; border: 1.5px solid #000000; width: ${showBenchCol || showSignCol ? '20%' : '24%'}; text-align: center; font-weight: 800; letter-spacing: 0.3px;">Address</th>
                        ${showBenchCol ? `<th style="padding: 6px; border: 1.5px solid #000000; width: 13%; text-align: center; font-weight: 800;">Bench No.</th>` : ``}
                        <th style="padding: 6px; border: 1.5px solid #000000; width: 15%; text-align: center; font-weight: 800; letter-spacing: 0.3px;">Seat No.</th>
                        <th style="padding: 6px; border: 1.5px solid #000000; width: 15%; text-align: center; font-weight: 800; letter-spacing: 0.3px;">Gender</th>
                        ${showSignCol ? `<th style="padding: 6px; border: 1.5px solid #000000; width: 15%; text-align: center; font-weight: 800;">Signature</th>` : ``}
                    </tr>
                </thead>
                <tbody>
        `;

        pageData.forEach((row, rowIndex) => {
            const bgColor = rowIndex % 2 === 0 ? "#ffffff" : "#eef2f6";
            htmlContent += `
                <tr style="background-color: ${bgColor}; ${trHeightStyle}">
                    <td style="padding: ${cellPadY}px 6px; border: 1.5px solid #000000; font-weight: 800; color: #000000; text-align: center; line-height: 1.2;">${row.roll}</td>
                    <td style="padding: ${cellPadY}px 6px; border: 1.5px solid #000000; color: #000000; text-align: center; font-weight: 800; line-height: 1.2;">${row.name}</td>
                    <td style="padding: ${cellPadY}px 6px; border: 1.5px solid #000000; color: #111827; text-align: center; font-weight: 600; line-height: 1.2;">${row.address}</td>
                    ${showBenchCol ? `<td style="padding: ${cellPadY}px 6px; border: 1.5px solid #000000; font-weight: 800; color: #1e3a8a; text-align: center; line-height: 1.2;">${row.benchNo}</td>` : ``}
                    <td style="padding: ${cellPadY}px 6px; border: 1.5px solid #000000; font-weight: 800; color: #1d4ed8; font-size: ${cellFontSize + 0.5}px; text-align: center; line-height: 1.2;">${row.seatNo}</td>
                    <td style="padding: ${cellPadY}px 6px; border: 1.5px solid #000000; color: #000000; text-align: center; font-weight: 700; line-height: 1.2;">${row.gender}</td>
                    ${showSignCol ? `<td style="padding: ${cellPadY}px 6px; border: 1.5px solid #000000; color: #111827; text-align: center; line-height: 1.2;">&nbsp;</td>` : ``}
                </tr>
            `;
        });

        htmlContent += `
                </tbody>
            </table>
        </div>
        <div style="text-align: center; margin-top: 3px; font-size: 11.5px; font-weight: 700; color: #374151;">
            Page ${pageIndex + 1} of ${pages.length}
        </div>
        </div>`;
    });

    htmlContent += `</div>`;

    const pdfContainer = document.getElementById('pdfContainer');
    pdfContainer.innerHTML = htmlContent;
    pdfContainer.style.display = 'block';

    const randomNum = Math.floor(Math.random() * 10000);
    const opt = {
        margin:       [5, 6, 4, 6],
        filename:     `SafaltaExpress_Seating_${randomNum}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 750, scrollX: 0, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: 'css', before: '.page-break' }
    };

    html2pdf().set(opt).from(pdfContainer).save().then(() => {
        pdfContainer.style.display = 'none';
        setStatus("🎉 PDF Successfully Downloaded! (नीचे Live Preview भी देख सकते हैं)", "#4ade80");
    }).catch(err => {
        console.error(err);
        pdfContainer.style.display = 'none';
        setStatus("❌ PDF बनाने में त्रुटि आई।", "#f87171");
    });
}

// Event Listeners Setup
window.addEventListener('DOMContentLoaded', () => {
    // Toggle Visual Step Guide
    document.getElementById('btnToggleGuide').addEventListener('click', () => {
        const g = document.getElementById('visualGuideSteps');
        g.classList.toggle('hidden');
    });
    renderBenchDiagram();

    // File Upload Listener
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length === 0) return;
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                if (jsonData.length === 0) {
                    setStatus("⚠️ यह फाइल खाली है!", "#f87171");
                    return;
                }
                rawLoadedRows = jsonData;
                updateSummaryBadges();
                setStatus(`✅ फाइल लोड हो गई: कुल ${jsonData.length} स्टूडेंट्स मिले। अब अपनी सेटिंग चुनकर Preview या PDF डाउनलोड करें।`, "#4ade80");
            } catch (err) {
                console.error(err);
                setStatus("❌ फाइल पढ़ने में त्रुटि आई। कृपया सही CSV/Excel फाइल चुनें।", "#f87171");
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // Demo Data Button
    document.getElementById('btnLoadDemo').addEventListener('click', () => {
        rawLoadedRows = [...DEMO_STUDENTS];
        updateSummaryBadges();
        setStatus("✅ 30 Demo Students (15 Boys, 15 Girls) सफलतापूर्वक लोड हो गए!", "#4ade80");
    });

    // Download Sample CSV Button
    document.getElementById('btnDownloadSample').addEventListener('click', () => {
        const ws = XLSX.utils.json_to_sheet(DEMO_STUDENTS);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "SafaltaExpress_Sample_Students.csv");
        setStatus("📥 Sample CSV फाइल डाउनलोड हो गई!", "#38bdf8");
    });

    // Mode Radio Cards
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            modeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const radio = card.querySelector('input[type="radio"]');
            radio.checked = true;
            currentGenderMode = card.getAttribute('data-mode');
            updateSummaryBadges();
        });
    });

    // Select Controls Change
    ['benchSizeSelect', 'seatRuleSelect', 'firstTurnSelect', 'orderModeSelect', 'rowsPerPageSelect'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateSummaryBadges);
    });

    // Quick Presets
    function highlightPreset(activeId) {
        ['presetIndex0', 'presetIndex1', 'presetOnlyBoys', 'presetOnlyGirls'].forEach(id => {
            const el = document.getElementById(id);
            if (id === activeId) {
                el.className = "text-xs py-2 px-2.5 rounded-lg border border-cyan-400 bg-cyan-950/70 text-cyan-200 font-semibold transition text-center";
            } else {
                el.className = "text-xs py-2 px-2.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 font-semibold hover:border-cyan-500/50 transition text-center";
            }
        });
    }

    document.getElementById('presetIndex0').addEventListener('click', () => {
        document.getElementById('benchSizeSelect').value = "3";
        document.getElementById('rowsPerPageSelect').value = "28";
        document.getElementById('seatRuleSelect').value = "skip4";
        document.querySelector('.mode-card[data-mode="alt_bench"]').click();
        highlightPreset('presetIndex0');
        setStatus("🏫 Preset 1 लागू: 3 Boys / 3 Girls Bench + 4th Seat Skip", "#38bdf8");
    });

    document.getElementById('presetIndex1').addEventListener('click', () => {
        document.getElementById('benchSizeSelect').value = "2";
        document.getElementById('rowsPerPageSelect').value = "28";
        document.getElementById('seatRuleSelect').value = "sequential";
        document.querySelector('.mode-card[data-mode="mix_random"]').click();
        highlightPreset('presetIndex1');
        setStatus("👫 Preset 2 लागू: 2 Students/Bench (Boys+Girls Mix) + Sequential Seat No.", "#38bdf8");
    });

    document.getElementById('presetOnlyBoys').addEventListener('click', () => {
        document.getElementById('seatRuleSelect').value = "sequential";
        document.querySelector('.mode-card[data-mode="only_boys"]').click();
        highlightPreset('presetOnlyBoys');
        setStatus("👦 Only Boys मोड लागू: सिर्फ लड़कों की सीटिंग बनेगी।", "#38bdf8");
    });

    document.getElementById('presetOnlyGirls').addEventListener('click', () => {
        document.getElementById('seatRuleSelect').value = "sequential";
        document.querySelector('.mode-card[data-mode="only_girls"]').click();
        highlightPreset('presetOnlyGirls');
        setStatus("👧 Only Girls मोड लागू: सिर्फ लड़कियों की सीटिंग बनेगी।", "#38bdf8");
    });

    // Advanced Options Toggle
    document.getElementById('btnToggleAdvanced').addEventListener('click', () => {
        const panel = document.getElementById('advancedPanel');
        const arrow = document.getElementById('advArrow');
        const isHidden = panel.classList.contains('hidden');
        if (isHidden) {
            panel.classList.remove('hidden');
            arrow.innerText = "▼";
        } else {
            panel.classList.add('hidden');
            arrow.innerText = "▶";
        }
    });

    // Password Show/Hide Toggle
    document.getElementById('btnTogglePass').addEventListener('click', () => {
        const passInput = document.getElementById('passwordInput');
        const btn = document.getElementById('btnTogglePass');
        if (passInput.type === "password") {
            passInput.type = "text";
            btn.innerText = "Hide";
        } else {
            passInput.type = "password";
            btn.innerText = "Show";
        }
    });

    // Preview Button
    document.getElementById('btnPreviewSeating').addEventListener('click', () => {
        if (!checkPasswordAccess()) return;
        const rows = buildSeatingAllocation();
        if (!rows) return;
        renderLivePreview(rows);
        setStatus(`👁️ Live Preview तैयार है (${rows.length} Students)। नीचे टेबल में देखें!`, "#4ade80");
    });

    // Re-shuffle Button
    document.getElementById('btnReshuffle').addEventListener('click', () => {
        if (!checkPasswordAccess()) return;
        const rows = buildSeatingAllocation();
        if (!rows) return;
        renderLivePreview(rows);
        setStatus(`🔀 सीटें नए सिरे से Shuffle कर दी गई हैं! (${rows.length} Students)`, "#38bdf8");
    });

    // Generate & Download PDF Button
    document.getElementById('btnDownloadPDF').addEventListener('click', () => {
        if (!checkPasswordAccess()) return;
        const rows = buildSeatingAllocation();
        if (!rows) return;
        renderLivePreview(rows);
        generatePDF(rows);
    });

    // Export Excel from Preview
    document.getElementById('btnExportExcel').addEventListener('click', () => {
        if (lastGeneratedRows.length === 0) return;
        const exportData = lastGeneratedRows.map(r => ({
            "Roll No.": r.roll,
            "Student Name": r.name,
            "Address": r.address,
            "Bench No.": r.benchNo,
            "Seat No.": r.seatNo,
            "Gender": r.gender
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SeatingPlan");
        XLSX.writeFile(wb, "SafaltaExpress_Seating_Plan.xlsx");
        setStatus("📊 Excel सीटिंग फाइल डाउनलोड हो गई!", "#4ade80");
    });

    // Close Preview
    document.getElementById('btnClosePreview').addEventListener('click', () => {
        document.getElementById('livePreviewSection').classList.add('hidden');
    });
});