function updateDisplayField(inputId, displayId, prefix = '', suffix = '', formatNumber = false) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    
    if (!input || !display) return; 
    
    const detailItem = display.parentElement;
    
    input.addEventListener('input', function() {
        if (input.value) {
            let displayValue = input.value;
            
            if (formatNumber && !isNaN(parseFloat(displayValue))) {
                displayValue = parseFloat(displayValue).toLocaleString('he-IL');
            }
            
            display.textContent = prefix + displayValue + suffix;
            
            detailItem.classList.remove('hidden-field');
        } else {
            display.textContent = '_________________';
            
            detailItem.classList.add('hidden-field');
        }
    });
    
    if (!input.value) {
        detailItem.classList.add('hidden-field');
    }
}

function initializeFieldVisibility() {
    document.querySelectorAll('[id^="display-"]').forEach(display => {
        if (['display-logo', 'display-advisor-name', 'display-advisor-phone', 
             'display-advisor-email', 'display-company'].includes(display.id)) {
            return;
        }
        
        const detailItem = display.parentElement;
        if (display.textContent === '_________________' || 
            display.textContent === 'אין הערות נוספות' || 
            display.textContent === '₪ 0') {
            detailItem.classList.add('hidden-field');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('display-advisor-name').textContent = 'תומר הדר, יועץ משכנתאות';
    document.getElementById('display-advisor-phone').textContent = '052-5218274';
    document.getElementById('display-advisor-email').textContent = 'tomerhadar1@gmail.com';
    document.getElementById('display-company').textContent = 'הדר משכנתאות וליווי פיננסי';
    
    document.querySelectorAll('.remove-client').forEach(button => {
        button.addEventListener('click', removeClient);
    });
    
    function removeClient() {
        const clientForm = this.closest('.client-form');
        const clientContainer = clientForm.parentElement;
        const clientDisplayContainer = document.getElementById('display-clients-container');
        const formIndex = Array.from(clientContainer.children).indexOf(clientForm);
        
        if (clientContainer.children.length === 1) {
            alert('חייב להישאר לפחות לווה אחד. ניתן למחוק את השדות אבל לא את הטופס.');
            
            clientForm.querySelectorAll('input').forEach(input => {
                input.value = '';
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            });
            
            return;
        }
        
        clientContainer.removeChild(clientForm);
        const clientDisplay = clientDisplayContainer.children[formIndex];
        clientDisplayContainer.removeChild(clientDisplay);
        
        clientContainer.querySelectorAll('.client-form').forEach((form, index) => {
            form.querySelector('.client-title').textContent = `לווה ${index + 1}`;
        });
        
        clientDisplayContainer.querySelectorAll('.client-subtitle').forEach((subtitle, index) => {
            subtitle.textContent = `לווה ${index + 1}`;
        });
    }

    updateDisplayField('client-name', 'display-client-name');
    updateDisplayField('client-phone', 'display-client-phone');
    updateDisplayField('client-address', 'display-client-address');
    updateDisplayField('client-city', 'display-client-city');
    updateDisplayField('service-type', 'display-service-type');
    updateDisplayField('payment-terms', 'display-payment-terms');
    updateDisplayField('quote-notes', 'display-notes');
    updateDisplayField('advisory-fee', 'display-fee', '₪ ', '', true);

    document.getElementById('quote-expiry').addEventListener('change', function() {
        const date = new Date(this.value);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('display-expiry').textContent = date.toLocaleDateString('he-IL', options);
    });

    document.getElementById('add-client').addEventListener('click', function() {
        const clientsContainer = document.getElementById('clients-container');
        const displayClientsContainer = document.getElementById('display-clients-container');
        const clientCount = clientsContainer.querySelectorAll('.client-form').length + 1;
        
        const newClientForm = document.createElement('div');
        newClientForm.className = 'client-form';
        newClientForm.innerHTML = `
            <div class="client-header">
                <span class="client-title">לווה ${clientCount}</span>
                <button type="button" class="remove-client">הסר</button>
            </div>
            
            <label for="client-name-${clientCount}">שם הלקוח</label>
            <input type="text" id="client-name-${clientCount}" placeholder="שם הלקוח" class="client-name-input">
            
            <label for="client-phone-${clientCount}">טלפון</label>
            <input type="text" id="client-phone-${clientCount}" placeholder="טלפון">
            
            <label for="client-address-${clientCount}">כתובת</label>
            <input type="text" id="client-address-${clientCount}" placeholder="כתובת">
            
            <label for="client-city-${clientCount}">עיר</label>
            <input type="text" id="client-city-${clientCount}" placeholder="עיר">
        `;
        
        const newClientDisplay = document.createElement('div');
        newClientDisplay.className = 'client-details';
        newClientDisplay.innerHTML = `
            <h4 class="client-subtitle">לווה ${clientCount}</h4>
            <div class="detail-item">
                <div class="detail-label">שם הלקוח</div>
                <div id="display-client-name-${clientCount}">_________________</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">טלפון</div>
                <div id="display-client-phone-${clientCount}">_________________</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">כתובת</div>
                <div id="display-client-address-${clientCount}">_________________</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">עיר</div>
                <div id="display-client-city-${clientCount}">_________________</div>
            </div>
        `;
        
        clientsContainer.appendChild(newClientForm);
        displayClientsContainer.appendChild(newClientDisplay);
        
        updateDisplayField(`client-name-${clientCount}`, `display-client-name-${clientCount}`);
        updateDisplayField(`client-phone-${clientCount}`, `display-client-phone-${clientCount}`);
        updateDisplayField(`client-address-${clientCount}`, `display-client-address-${clientCount}`);
        updateDisplayField(`client-city-${clientCount}`, `display-client-city-${clientCount}`);
        
        newClientForm.querySelector('.remove-client').addEventListener('click', removeClient);
    });

document.getElementById('generate-pdf').addEventListener('click', exportQuoteAsHTML);

function exportQuoteAsHTML() {
    const clientNameInput = document.querySelector('.client-name-input');
    let fileName = 'הצעת מחיר ייעוץ משכנתא';
    
    if (clientNameInput && clientNameInput.value) {
        fileName += ' - ' + clientNameInput.value;
    }
    
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        alert('הדפדפן חסם את החלון הקופץ. אנא אפשר חלונות קופצים ונסה שנית.');
        return;
    }
    
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${fileName}</title>
        <style>
    `;
    
    htmlContent += `
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        :root {
            --primary-color: #c0aa76;
            --primary-dark: #a18e5e;
            --secondary-color: #2c3e50;
            --light-gold: #e6dcc3;
            --text-dark: #333333;
            --text-light: #ffffff;
        }
        
        body {
            direction: rtl;
            background-color: white;
            padding: 20mm;
            max-width: 210mm;
            margin: 0 auto;
        }
        
        .quote-container {
            background-color: white;
            border-radius: 5px;
        }
        
        .quote-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--light-gold);
        }
        
        .quote-logo {
            max-width: 180px;
            max-height: 120px;
        }
        
        .quote-title {
            text-align: center;
            margin: 40px 0;
            font-size: 28px;
            font-weight: bold;
            color: var(--primary-color);
            position: relative;
            letter-spacing: 1px;
        }
        
        .quote-section {
            margin-bottom: 30px;
        }
        
        .quote-section h3 {
            margin-bottom: 15px;
            border-bottom: 2px solid var(--light-gold);
            padding-bottom: 8px;
            color: var(--primary-color);
            font-size: 20px;
            letter-spacing: 0.5px;
        }
        
        .client-details, .loan-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background-color: #fafafa;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #eee;
        }
        
        .detail-item {
            margin-bottom: 15px;
        }
        
        .detail-label {
            font-weight: bold;
            margin-bottom: 8px;
            color: var(--primary-dark);
        }
        
        .detail-label::after {
            content: " ";
        }
        
        .hidden-section, .hidden-field {
            display: none !important;
        }
        
        .payment-details, .service-details {
            background-color: #fafafa;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #eee;
        }
        
        .quote-footer {
            margin-top: 40px;
            text-align: center;
            font-size: 14px;
            color: #777;
            border-top: 2px solid var(--light-gold);
            padding-top: 20px;
        }
        
        .quote-signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
        }
        
        .signature-line {
            width: 200px;
            border-top: 1px solid #000;
            margin-top: 5px;
        }
        
        .website-link {
            color: var(--primary-color);
        }
        
        .client-subtitle {
            color: var(--primary-color);
            margin-bottom: 15px;
            font-size: 18px;
            text-align: center;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .print-controls {
                display: none;
            }
        }
        
        .print-controls {
            position: fixed;
            top: 20px;
            left: 20px;
            background: #fff;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        
        .print-btn {
            padding: 8px 15px;
            background-color: var(--primary-color);
            color: var(--text-dark);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            margin-right: 10px;
        }
        
        .save-btn {
            padding: 8px 15px;
            background-color: var(--secondary-color);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
        }
    `;
    
    htmlContent += `
        </style>
    </head>
    <body>
        <div class="print-controls">
            <button class="print-btn" onclick="window.print()">הדפס</button>
        </div>
        <div class="quote-container">
    `;
    
    const quoteContent = document.getElementById('quote-to-print');
    
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = quoteContent.innerHTML;
    
    const logoImg = tempContainer.querySelector('.quote-logo');
    if (logoImg) {
        const logoSrc = logoImg.getAttribute('src');
        if (logoSrc && !logoSrc.startsWith('data:') && !logoSrc.startsWith('http')) {
            // בניית נתיב מלא ללוגו באמצעות URL הנוכחי
            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            logoImg.setAttribute('src', baseUrl + logoSrc);
        }
    }
    
    const sections = tempContainer.querySelectorAll('.quote-section');
    sections.forEach(section => {
        const hasContent = Array.from(section.querySelectorAll('.detail-item')).some(item => 
            !item.classList.contains('hidden-field'));
        
        if (!hasContent) {
            section.classList.add('hidden-section');
        }
    });
    
    htmlContent += tempContainer.innerHTML;
    
    htmlContent += `
        </div>
        <script>

            
            // הסתרת כפתורי ההדפסה והשמירה בעת הדפסה
            window.addEventListener('beforeprint', function() {
                document.querySelector('.print-controls').style.display = 'none';
            });
            
            window.addEventListener('afterprint', function() {
                document.querySelector('.print-controls').style.display = 'block';
            });
        </script>
    </body>
    </html>`;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.addEventListener('load', function() {
        printWindow.focus();
    });
}

    
    document.getElementById('reset-form').addEventListener('click', function() {
        const confirmation = confirm('האם אתה בטוח שברצונך לנקות את כל הנתונים?');
        if (confirmation) {
            document.querySelectorAll('input, textarea, select').forEach(input => {
                input.value = '';
            });
            
            document.querySelectorAll('[id^="display-"]').forEach(display => {
                if (!['display-logo', 'display-advisor-name', 'display-advisor-phone', 'display-advisor-email', 'display-company'].includes(display.id)) {
                    display.textContent = '_________________';
                }
            });
            
            const clientsContainer = document.getElementById('clients-container');
            const displayClientsContainer = document.getElementById('display-clients-container');
            
            const clientForms = clientsContainer.querySelectorAll('.client-form');
            const clientDisplays = displayClientsContainer.querySelectorAll('.client-details');
            
            for (let i = 1; i < clientForms.length; i++) {
                clientsContainer.removeChild(clientForms[i]);
            }
            
            for (let i = 1; i < clientDisplays.length; i++) {
                displayClientsContainer.removeChild(clientDisplays[i]);
            }
            
            checkSectionVisibility();
        }
    });

    initializeFieldVisibility();
});