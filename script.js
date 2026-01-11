//key a: sigma
//key b: average
//key c: my value
//key d: my T-score
//key e: variation

document.addEventListener("DOMContentLoaded", () => {
  const keys = ["a", "b", "c", "d", "e"];
  const tds = {
    "2": [5, 11, 12],
    "3": [1, 5, 6, 8, 11, 12, 13],
    "4": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  };
  const vars = ["ABCD", "ABC", "ABD", "ACD", "BCD", "AB", "AC", "AD", "BC", "BD", "CD", "A", "B", "C", "D"];
  const symbols = {
    "2": ["A", "B", "AB"],
    "3": ["A", "B", "C", "AB", "AC", "BC"],
    "4": ["A", "B", "C", "D", "AB", "AC", "AD", "BC", "BD", "CD"]
  };
  const pairs = ["AB", "AC", "AD", "AB", "BC", "BD", "AC", "BC", "CD", "AD", "BD", "CD"];
  let maxVars = 3;
  let inputDisabled = false;

  const selectVariable = document.getElementById("select-variable");
  const cloneHTML = document.getElementById("row-_N_").outerHTML;
  for (let i = 0; i < 15; i++) {
    const html = cloneHTML.replaceAll("_N_", i).replaceAll("_X_", vars[i]);
    document.getElementById("table-body").innerHTML += html;
  }

  for (let i = 0; i < 15; i++) {
    const inputs = keys.map(k =>
      document.getElementById("input-" + i + "-" + k)
    );
    const cells = keys.map(k =>
      document.getElementById("cell-" + i + "-" + k)
    );
    //const resultC = document.getElementById("result-" + i + "-c");

    function round(val) {
      if (!val) return val;
      if (!isFinite(val)) return NaN;
      let mag = 3 - Math.floor(Math.log10(Math.abs(val)));
      let factor = Math.pow(10, mag);
      let rounded = Math.round(val * factor);
      let res = rounded / factor;
      return mag > 0 && mag < 7 ? res : (rounded / 1000) + "E" + (3 - mag);
    }

    function updateCells() {
      const vals = inputs.map(input => input.value);
      const num = vals.map(val => parseFloat(val));
      let mode = [0, 0, 0, 0, 0]; // 0: empty, 1: manual, 2: auto

      if (vals[0]) {
        inputs[1].setAttribute("placeHolder", "-");
        inputs[2].setAttribute("placeHolder", "-");
        inputs[3].setAttribute("placeHolder", "-");
        let eNum = num[0] * num[0];
        inputs[4].setAttribute("placeHolder", round(eNum));
        mode = [1, 0, 0, 0, 2];
      } else if (vals[1] && vals[2] && vals[3]) {
        let aNum = (num[2] - num[1]) / (num[3] - 50) * 10;
        inputs[0].setAttribute("placeHolder", round(aNum));
        let eNum = aNum * aNum;
        inputs[4].setAttribute("placeHolder", round(eNum));
        mode = [2, 1, 1, 1, 2];
      } else if (vals[4]) {
        let aNum = Math.sqrt(num[4]);
        inputs[0].setAttribute("placeHolder", round(aNum));
        inputs[1].setAttribute("placeHolder", "-");
        inputs[2].setAttribute("placeHolder", "-");
        inputs[3].setAttribute("placeHolder", "-");
        mode = [2, 0, 0, 0, 1];
      } else {
        inputs.forEach(input => {
          input.setAttribute("placeHolder", "-");
        });
      }

      mode.forEach((m, index) => {
        const cell = cells[index];
        cell.classList.remove("input-active", "input-auto");
        if (m === 1) cell.classList.add("input-active");
        if (m === 2) cell.classList.add("input-auto");
      });

      updateOverall();
    }

    inputs[0].addEventListener("input", () => {
      if (inputs[0].value) {
        inputs[1].value = "";
        inputs[2].value = "";
        inputs[3].value = "";
        inputs[4].value = "";
      };
      updateCells();
    });
    inputs[1].addEventListener("input", () => {
      if (inputs[1].value) {
        inputs[0].value = "";
        inputs[4].value = "";
      };
      updateCells();
    });
    inputs[2].addEventListener("input", () => {
      if (inputs[2].value) {
        inputs[0].value = "";
        inputs[4].value = "";
      };
      updateCells();
    });
    inputs[3].addEventListener("input", () => {
      if (inputs[3].value) {
        inputs[0].value = "";
        inputs[4].value = "";
      };
      updateCells();
    });
    inputs[4].addEventListener("input", () => {
      if (inputs[4].value) {
        inputs[0].value = "";
        inputs[1].value = "";
        inputs[2].value = "";
        inputs[3].value = "";
      };
      updateCells();
    });
  }

  function toggleDisplay(row, flag) {
    row.style.display = flag ? "" : "none";
  }

  function updateResultDisplay(val, flag) {
    const cells = document.getElementsByClassName("require-" + val);
    for (let i = 0; i < cells.length; i++) {
      toggleDisplay(cells[i], flag);
    }
  }

  function updateRows(val) {
    const indices = tds[val];
    for (let i = 0; i < 15; i++) {
      const row = document.getElementById("row-" + i);
      toggleDisplay(row, indices.includes(i));
    }
    switch (val) {
      case "2":
        updateResultDisplay("3", false);
        updateResultDisplay("4", false);
        document.getElementById("max-vars").innerText = maxVars = 3;
        break;
      case "3":
        updateResultDisplay("3", true);
        updateResultDisplay("4", false);
        document.getElementById("max-vars").innerText = maxVars = 6;
        break;
      case "4":
        updateResultDisplay("3", true);
        updateResultDisplay("4", true);
        document.getElementById("max-vars").innerText = maxVars = 10;
        break;
    }
  }

  function gaussianElimination(matrix, n) {
    const m = matrix.length; // k
    const eps = 1e-10;
    let row = 0;
    const pivotCol = Array(n).fill(-1);

    for (let col = 0; col < n && row < m; col++) {
      let sel = row;
      for (let i = row; i < m; i++) {
        if (Math.abs(matrix[i][col]) > Math.abs(matrix[sel][col])) {
          sel = i;
        }
      }

      if (Math.abs(matrix[sel][col]) < eps) continue;

      [matrix[row], matrix[sel]] = [matrix[sel], matrix[row]];

      const div = matrix[row][col];
      for (let j = col; j <= n; j++) {
        matrix[row][j] /= div;
      }

      for (let i = 0; i < m; i++) {
        if (i !== row) {
          const factor = matrix[i][col];
          for (let j = col; j <= n; j++) {
            matrix[i][j] -= factor * matrix[row][j];
          }
        }
      }

      pivotCol[col] = row;
      row++;
    }

    return pivotCol;
  }

  function solveDeterminedVariables(matrix, n) {
    const mat = matrix.map(row => row.slice());
    const pivotCol = gaussianElimination(mat, n);

    const determined = [];

    for (let col = 0; col < n; col++) {
      const r = pivotCol[col];
      if (r !== -1) {
        let free = false;
        for (let c = col + 1; c < n; c++) {
          if (Math.abs(mat[r][c]) > 1e-10 && pivotCol[c] === -1) {
            free = true;
            break;
          }
        }

        if (!free) {
          determined.push([col, mat[r][n]]);
        }
      }
    }

    return determined;
  }

  function isValid(v) {
    return v === 0 || v;
  }

  function updateOverall() {
    const vs = tds["4"].map(i => {
      const e = document.getElementById("input-" + i + "-e");
      if (e.getAttribute("overallCalculated") === "true") return [false, i];
      return [e.value || e.getAttribute("placeHolder"), i];
    });
    const available = vs.filter(v => isValid(v) && !isNaN(parseFloat(v[0])) && tds[selectVariable.value].includes(v[1]));
    const n = available.length;
    document.getElementById("input-vars").innerText = n;

    if (n >= maxVars) {
      for (let i = 0; i < 15; i++) {
        if (isValid(vs[i][0]) && !isNaN(parseFloat(vs[i][0]))) continue;
        const inputs = keys.map(k =>
          document.getElementById("input-" + i + "-" + k)
        );
        inputs.forEach(input => input.disabled = true);
      }
      inputDisabled = true;
    } else if (inputDisabled) {
      for (let i = 0; i < 15; i++) {
        const inputs = keys.map(k =>
          document.getElementById("input-" + i + "-" + k)
        );
        inputs.forEach(input => input.disabled = false);
      }
      inputDisabled = false;
    }

    const symbols1 = symbols[selectVariable.value];
    let matrix = [];
    for (let i = 0; i < n; i++) {
      const index = available[i][1];
      const sys = symbols1.map((s, i) => [s, i]).filter(s => s[0].split("").every(c => vars[index].includes(c)));
      let res = symbols1.map(k => {
        const symbol = sys.find(s => s[0] === k);
        return symbol ? symbol[0].length : 0;
      });
      res.push(parseFloat(available[i][0]));
      matrix.push(res);
    }

    const solution = solveDeterminedVariables(matrix, maxVars);
    pairs.forEach((pair, i) => {
      const resultCell = document.getElementById("result-" + i);
      const symbol1 = symbols1.indexOf(pair[0]);
      const symbol2 = symbols1.indexOf(pair[1]);
      const symbol3 = symbols1.indexOf(pair);
      if (symbol1 === -1 || symbol2 === -1 || symbol3 === -1) {
        resultCell.innerText = "-";
        return;
      }
      const syi1 = solution.find(s => s[0] === symbol1);
      const syi2 = solution.find(s => s[0] === symbol2);
      const syi3 = solution.find(s => s[0] === symbol3);
      if ([syi1, syi2, syi3].every(isValid) && [syi1[1], syi2[1], syi3[1]].every(isValid)) {
        const val = syi3[1] / Math.sqrt(syi1[1] * syi2[1]);
        resultCell.innerText = round(val);
      } else {
        resultCell.innerText = "-";
      }
    });

    vs.forEach(v => {
      if (isValid(v) && !isNaN(parseFloat(v[0])) && tds[selectVariable.value].includes(v[1])) return;
      const index = v[1];
      const sys = symbols1.map((s, i) => [s, i]).filter(s => s[0].split("").every(c => vars[index].includes(c)));
      const row = symbols1.map(k => {
        const symbol = sys.find(s => s[0] === k);
        return symbol ? symbol[0].length : 0;
      });
      let flag = true;
      let res = 0;
      for (let i = 0; i < row.length; i++) {
        const coe = row[i];
        if (coe === 0) continue;
        const syi = solution.find(s => s[0] === i);
        if (!isValid(syi) || !isValid(syi[1])) {
          flag = false;
          break;
        }
        res += coe * syi[1];
      }
      const resultACell = document.getElementById("input-" + index + "-a");
      const resultECell = document.getElementById("input-" + index + "-e");
      if (flag) {
        resultACell.setAttribute("placeholder", round(Math.sqrt(res)));
        resultECell.setAttribute("placeholder", round(res));
        resultECell.setAttribute("overallCalculated", true);
      } else {
        resultACell.setAttribute("placeholder", "-");
        resultECell.setAttribute("placeholder", "-");
        resultECell.setAttribute("overallCalculated", false);
      }
    });
  }

  selectVariable.addEventListener("change", () => {
    const val = selectVariable.value;
    updateRows(val);
    updateOverall();
  });

  updateRows("2");
});