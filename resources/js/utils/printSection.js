// 🖨️ printSection.js — Optimized for Reports Page (Joelaar Micro-Credit)
export function printSection(element, title = "Report") {
    if (!element) {
        alert("⚠️ Nothing to print — section not found.");
        return;
    }

    // ✅ Detect app or company name from meta tag or document title
    const appName =
        document.querySelector("meta[name='app-name']")?.content ||
        document.title ||
        "Joelaar Micro-Credit";

    // ✅ Get only the HTML content of the report area
    const reportHTML = element.innerHTML;

    // ✅ Create a temporary print window
    const newWin = window.open("", "_blank", "width=900,height=700");

    // ✅ Write full printable HTML layout
    newWin.document.write(`
    <html>
      <head>
        <title>${title} - ${appName}</title>
        <meta charset="utf-8" />
        <style>
          /* ======= PAGE STYLES ======= */
          body {
            font-family: "Arial", sans-serif;
            margin: 25px;
            color: #111;
            background-color: #fff;
          }

          header {
            text-align: center;
            margin-bottom: 25px;
          }

          header img {
            width: 90px;
            margin-bottom: 10px;
          }

          h1 {
            margin: 0;
            font-size: 22px;
            text-transform: uppercase;
          }

          h2 {
            margin: 4px 0 0;
            font-size: 16px;
            color: #555;
          }

          p {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
          }

          hr {
            margin: 15px 0;
            border: 0;
            border-top: 1px solid #ccc;
          }

          /* ======= TABLE STYLING ======= */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 10px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }

          th {
            background-color: #f3f3f3;
            font-weight: bold;
          }

          tr:nth-child(even) td {
            background-color: #fafafa;
          }

          /* ======= FOOTER ======= */
          footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #555;
          }

          /* ======= PRINT SETTINGS ======= */
          @media print {
            @page { size: A4; margin: 15mm; }
            button { display: none !important; }
          }
        </style>
      </head>

      <body>
        <header>
          <!-- ✅ Company Logo (hidden if missing) -->
          <img src="/images/logo.png" alt="Company Logo" onerror="this.style.display='none'">
          <h1>${appName}</h1>
          <h2>${title}</h2>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <hr />
        </header>

        ${reportHTML}

        <footer>
          <hr />
          <p>Prepared by ${window?.Laravel?.user?.name || "System User"} — ${new Date().toLocaleDateString()}</p>
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </footer>
      </body>
    </html>
  `);

    newWin.document.close();

    // ✅ Print when ready
    newWin.onload = () => {
        newWin.focus();
        newWin.print();
        setTimeout(() => newWin.close(), 500);
    };
}
