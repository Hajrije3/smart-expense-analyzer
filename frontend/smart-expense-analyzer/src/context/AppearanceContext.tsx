import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const CURRENCY_CODES: Record<string, string> = {
    "USD ($)": "USD", "EUR (€)": "EUR", "GBP (£)": "GBP",
    "JPY (¥)": "JPY", "CAD (C$)": "CAD", "AUD (A$)": "AUD",
    "CHF (CHF)": "CHF", "CNY (¥)": "CNY", "INR (₹)": "INR", "BRL (R$)": "BRL",
};
const getCurrencyCode = (c: string) => CURRENCY_CODES[c] ?? "EUR";


const T: Record<string, Record<string, string>> = {
    English: {
        // Nav
        dashboard:"Dashboard", transactions:"Transactions", analytics:"Analytics", budgets:"Budgets", insights:"Insights", settings:"Settings", logout:"Logout",
        // Dashboard
        welcome:"Welcome back", finances_today:"Here's what's happening with your finances today.", total_balance:"Total Balance", monthly_spending:"Monthly Spending", savings_rate:"Savings Rate", budget_status:"Budget Status",
        // Transactions
        track_manage:"Track and manage all your expenses", add_transaction:"Add Transaction", export:"Export", search:"Search transactions...", all:"All", income:"Income", expense:"Expense", all_categories:"All Categories", delete_transaction:"Delete Transaction", delete_tx_confirm:"Are you sure you want to delete this transaction? This action cannot be undone.", cancel:"Cancel", delete:"Delete",
        // Analytics
        deep_dive:"Deep dive into your spending patterns", range_7d:"7 Days", range_1m:"1 Month", range_3m:"3 Months", range_6m:"6 Months", range_1y:"1 Year", loading:"Loading...", no_data:"No data available",
        // Budgets
        set_track:"Set and track your spending limits", add_budget:"Add Budget", total_budget:"Total Budget", for_this_month:"For this month", total_spent:"Total Spent", pct_of_budget:"% of budget", remaining_label:"Remaining", available_to_spend:"Available to spend", no_budgets:"No budgets yet", no_budgets_desc:"Click \"+ Add Budget\" to create your first spending limit.", pct_used:"% used", left:"left", approaching_limit:"You're approaching your budget limit", edit_budget:"Edit Budget", add_budget_modal:"Add Budget", category_label:"Category", budget_limit:"Budget Limit", period_label:"Period", weekly:"Weekly", monthly:"Monthly", yearly:"Yearly", saving:"Saving…", save_changes:"Save Changes", create_budget:"Create Budget",
        // Settings
        manage_account:"Manage your account and preferences", appearance:"Appearance", dark_mode:"Dark Mode", toggle_dark:"Toggle dark color scheme", currency_label:"Currency", language_label:"Language", member_since:"Member since", profile_info:"Profile Information", full_name:"Full Name", name_placeholder:"Your name", email_address:"Email Address", change_password:"Change Password", password_hint:"Use a strong password at least 6 characters long", current_password:"Current Password", new_password:"New Password", confirm_password:"Confirm New Password", updating:"Updating…", update_password:"Update Password", danger_zone:"Danger Zone", danger_zone_desc:"Permanently delete your account and all data", delete_account:"Delete Account", delete_warning:"This will permanently delete your account, all transactions, and budgets. This action cannot be undone.", confirm_your_password:"Confirm your password", type_delete:"Type DELETE to confirm", deleting:"Deleting…", permanently_delete:"Permanently Delete Account",
        // Insights
        ai_powered:"AI-powered financial analysis and recommendations", ask_placeholder:"Ask a specific question (optional)…", analyzing:"Analyzing…", refresh:"Refresh", generate_insights:"Generate Insights", no_insights_title:"No insights yet", no_insights_desc:"Click \"Generate Insights\" to get your personalized AI financial analysis.", potential_savings:"Potential Monthly Savings", opportunity:"opportunity", opportunities:"opportunities", based_on_ops:"Based on", identified:"identified", financial_health:"Financial Health", financial_insights:"Financial Insights", financial_insights_desc:"Personalized analysis of your spending patterns", recommendations:"Recommendations", recommendations_desc:"Actionable steps to improve your finances", spending_patterns:"Spending Patterns", spending_patterns_desc:"Trends observed in your transaction history",
        // Components
        avg_monthly:"Avg Monthly Spending", based_last_7:"Based on last 7 months", highest_category:"Highest Category", this_month:"this month", no_expenses_month:"No expenses this month", of_monthly_income:"Of monthly income",
        category_breakdown:"Category Breakdown", where_money_goes:"Where your money goes", no_expense_data:"No expense data this month",
        weekly_comparison:"Weekly Comparison", this_month_label:"This month", vs_label:"vs", last_month_label:"last month", avg_this_month:"Avg This Month", avg_last_month:"Avg Last Month",
        spending_trend:"Spending Trend", monthly_patterns:"Monthly spending patterns",
        income_vs_expenses:"Income vs Expenses", track_health:"Track your financial health over time", no_data_period:"No data available for this period",
        col_category:"Category", col_type:"Type", col_date:"Date", col_status:"Status", col_amount:"Amount", col_actions:"Actions", tx_completed:"Completed", edit:"Edit", save_changes_btn:"Save Changes",
        // Extra components
        avg_daily_spending:"Avg. Daily Spending", top_category:"Top Category", avg_transaction:"Avg. Transaction", per_expense_month:"per expense this month",
        recent_transactions:"Recent Transactions", view_all:"View All", latest_activity:"Your latest activity", no_transactions_yet:"No transactions yet",
        key_insights:"Key Insights", no_insights_available:"No insights available",
        last_6_months:"Last 6 months",
        edit_transaction:"Edit Transaction", amount_label:"Amount", select_category_placeholder:"Select category", description_optional:"Description (optional)", processing:"Processing...", update_transaction:"Update Transaction",
        year_over_year_title:"Year-over-Year Comparison", monthly_expenses_subtitle:"Monthly expenses:",
        vs_last_month:"vs last month",
        no_notifications_yet:"No notifications yet", just_now:"just now", min_ago:"m ago", hour_ago:"h ago", day_ago:"d ago",
    },
    Italian: {
        dashboard:"Pannello", transactions:"Transazioni", analytics:"Analisi", budgets:"Bilanci", insights:"Intuizioni", settings:"Impostazioni", logout:"Disconnetti",
        welcome:"Bentornato", finances_today:"Ecco cosa sta succedendo con le tue finanze oggi.", total_balance:"Saldo Totale", monthly_spending:"Spesa Mensile", savings_rate:"Tasso di Risparmio", budget_status:"Stato del Budget",
        track_manage:"Traccia e gestisci tutte le tue spese", add_transaction:"+ Aggiungi Transazione", export:"Esporta", search:"Cerca transazioni...", all:"Tutti", income:"Entrate", expense:"Spesa", all_categories:"Tutte le Categorie", delete_transaction:"Elimina Transazione", delete_tx_confirm:"Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.", cancel:"Annulla", delete:"Elimina",
        deep_dive:"Analisi approfondita delle tue abitudini di spesa", range_7d:"7 Giorni", range_1m:"1 Mese", range_3m:"3 Mesi", range_6m:"6 Mesi", range_1y:"1 Anno", loading:"Caricamento...", no_data:"Nessun dato disponibile",
        set_track:"Imposta e monitora i tuoi limiti di spesa", add_budget:"Aggiungi Budget", total_budget:"Budget Totale", for_this_month:"Per questo mese", total_spent:"Totale Speso", pct_of_budget:"% del budget", remaining_label:"Rimanente", available_to_spend:"Disponibile da spendere", no_budgets:"Nessun budget", no_budgets_desc:"Clicca su \"+ Aggiungi Budget\" per creare il tuo primo limite.", pct_used:"% usato", left:"rimasto", approaching_limit:"Stai avvicinandoti al tuo limite di budget", edit_budget:"Modifica Budget", add_budget_modal:"Aggiungi Budget", category_label:"Categoria", budget_limit:"Limite Budget", period_label:"Periodo", weekly:"Settimanale", monthly:"Mensile", yearly:"Annuale", saving:"Salvataggio…", save_changes:"Salva Modifiche", create_budget:"Crea Budget",
        manage_account:"Gestisci il tuo account e le preferenze", appearance:"Aspetto", dark_mode:"Modalità Scura", toggle_dark:"Attiva schema colori scuro", currency_label:"Valuta", language_label:"Lingua", member_since:"Membro da", profile_info:"Informazioni Profilo", full_name:"Nome Completo", name_placeholder:"Il tuo nome", email_address:"Indirizzo Email", change_password:"Cambia Password", password_hint:"Usa una password di almeno 6 caratteri", current_password:"Password Attuale", new_password:"Nuova Password", confirm_password:"Conferma Nuova Password", updating:"Aggiornamento…", update_password:"Aggiorna Password", danger_zone:"Zona Pericolosa", danger_zone_desc:"Elimina definitivamente il tuo account e tutti i dati", delete_account:"Elimina Account", delete_warning:"Questo eliminerà definitivamente il tuo account, tutte le transazioni e i budget. Questa azione non può essere annullata.", confirm_your_password:"Conferma la tua password", type_delete:"Digita ELIMINA per confermare", deleting:"Eliminazione…", permanently_delete:"Elimina Account Definitivamente",
        ai_powered:"Analisi finanziaria basata sull'IA", ask_placeholder:"Fai una domanda specifica (opzionale)…", analyzing:"Analisi in corso…", refresh:"Aggiorna", generate_insights:"Genera Intuizioni", no_insights_title:"Nessuna intuizione ancora", no_insights_desc:"Clicca su \"Genera Intuizioni\" per la tua analisi finanziaria personalizzata.", potential_savings:"Risparmio Mensile Potenziale", opportunity:"opportunità", opportunities:"opportunità", based_on_ops:"Basato su", identified:"identificate", financial_health:"Salute Finanziaria", financial_insights:"Intuizioni Finanziarie", financial_insights_desc:"Analisi personalizzata dei tuoi modelli di spesa", recommendations:"Raccomandazioni", recommendations_desc:"Passi concreti per migliorare le tue finanze", spending_patterns:"Modelli di Spesa", spending_patterns_desc:"Tendenze nel tuo storico transazioni",
        avg_monthly:"Spesa Media Mensile", based_last_7:"Basato sugli ultimi 7 mesi", highest_category:"Categoria Principale", this_month:"questo mese", no_expenses_month:"Nessuna spesa questo mese", of_monthly_income:"Del reddito mensile",
        category_breakdown:"Ripartizione per Categoria", where_money_goes:"Dove vanno i tuoi soldi", no_expense_data:"Nessun dato di spesa questo mese",
        weekly_comparison:"Confronto Settimanale", this_month_label:"Questo mese", vs_label:"vs", last_month_label:"mese scorso", avg_this_month:"Media Questo Mese", avg_last_month:"Media Mese Scorso",
        spending_trend:"Tendenza di Spesa", monthly_patterns:"Modelli di spesa mensile",
        income_vs_expenses:"Entrate vs Spese", track_health:"Monitora la tua salute finanziaria", no_data_period:"Nessun dato per questo periodo",
        col_category:"Categoria", col_type:"Tipo", col_date:"Data", col_status:"Stato", col_amount:"Importo", col_actions:"Azioni", tx_completed:"Completato", edit:"Modifica", save_changes_btn:"Salva Modifiche",
        avg_daily_spending:"Spesa Media Giornaliera", top_category:"Categoria Principale", avg_transaction:"Transazione Media", per_expense_month:"per spesa questo mese",
        recent_transactions:"Transazioni Recenti", view_all:"Vedi Tutto", latest_activity:"La tua ultima attività", no_transactions_yet:"Nessuna transazione ancora",
        key_insights:"Intuizioni Chiave", no_insights_available:"Nessuna intuizione disponibile",
        last_6_months:"Ultimi 6 mesi",
        edit_transaction:"Modifica Transazione", amount_label:"Importo", select_category_placeholder:"Seleziona categoria", description_optional:"Descrizione (opzionale)", processing:"Elaborazione...", update_transaction:"Aggiorna Transazione",
        year_over_year_title:"Confronto Anno su Anno", monthly_expenses_subtitle:"Spese mensili:",
        vs_last_month:"rispetto al mese scorso",
        no_notifications_yet:"Nessuna notifica ancora", just_now:"adesso", min_ago:" min fa", hour_ago:" h fa", day_ago:" g fa",
    },
    Arabic: {
        dashboard:"لوحة التحكم", transactions:"المعاملات", analytics:"التحليلات", budgets:"الميزانيات", insights:"الرؤى", settings:"الإعدادات", logout:"تسجيل الخروج",
        welcome:"مرحبًا بعودتك", finances_today:"إليك ما يحدث مع أموالك اليوم.", total_balance:"الرصيد الإجمالي", monthly_spending:"الإنفاق الشهري", savings_rate:"معدل الادخار", budget_status:"حالة الميزانية",
        track_manage:"تتبع وإدارة جميع نفقاتك", add_transaction:"+ إضافة معاملة", export:"تصدير", search:"بحث في المعاملات...", all:"الكل", income:"الدخل", expense:"المصروف", all_categories:"جميع الفئات", delete_transaction:"حذف المعاملة", delete_tx_confirm:"هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.", cancel:"إلغاء", delete:"حذف",
        deep_dive:"تعمق في أنماط الإنفاق", range_7d:"7 أيام", range_1m:"شهر", range_3m:"3 أشهر", range_6m:"6 أشهر", range_1y:"سنة", loading:"جار التحميل...", no_data:"لا تتوفر بيانات",
        set_track:"حدد وتتبع حدود الإنفاق", add_budget:"إضافة ميزانية", total_budget:"إجمالي الميزانية", for_this_month:"لهذا الشهر", total_spent:"إجمالي الإنفاق", pct_of_budget:"% من الميزانية", remaining_label:"المتبقي", available_to_spend:"متاح للإنفاق", no_budgets:"لا توجد ميزانيات", no_budgets_desc:"انقر على \"+ إضافة ميزانية\" لإنشاء أول حد إنفاق.", pct_used:"% مستخدم", left:"متبقي", approaching_limit:"أنت تقترب من حد ميزانيتك", edit_budget:"تعديل الميزانية", add_budget_modal:"إضافة ميزانية", category_label:"الفئة", budget_limit:"حد الميزانية", period_label:"الفترة", weekly:"أسبوعي", monthly:"شهري", yearly:"سنوي", saving:"جار الحفظ…", save_changes:"حفظ التغييرات", create_budget:"إنشاء ميزانية",
        manage_account:"إدارة حسابك وتفضيلاتك", appearance:"المظهر", dark_mode:"الوضع الداكن", toggle_dark:"تبديل نظام الألوان الداكن", currency_label:"العملة", language_label:"اللغة", member_since:"عضو منذ", profile_info:"معلومات الملف الشخصي", full_name:"الاسم الكامل", name_placeholder:"اسمك", email_address:"عنوان البريد الإلكتروني", change_password:"تغيير كلمة المرور", password_hint:"استخدم كلمة مرور لا تقل عن 6 أحرف", current_password:"كلمة المرور الحالية", new_password:"كلمة المرور الجديدة", confirm_password:"تأكيد كلمة المرور الجديدة", updating:"جار التحديث…", update_password:"تحديث كلمة المرور", danger_zone:"منطقة الخطر", danger_zone_desc:"حذف حسابك وجميع بياناتك نهائيًا", delete_account:"حذف الحساب", delete_warning:"سيؤدي هذا إلى حذف حسابك وجميع معاملاتك وميزانياتك نهائيًا. لا يمكن التراجع عن هذا الإجراء.", confirm_your_password:"تأكيد كلمة المرور", type_delete:"اكتب حذف للتأكيد", deleting:"جار الحذف…", permanently_delete:"حذف الحساب نهائيًا",
        ai_powered:"تحليل مالي مدعوم بالذكاء الاصطناعي", ask_placeholder:"اطرح سؤالاً محدداً (اختياري)…", analyzing:"جار التحليل…", refresh:"تحديث", generate_insights:"توليد الرؤى", no_insights_title:"لا توجد رؤى بعد", no_insights_desc:"انقر على \"توليد الرؤى\" للحصول على تحليلك المالي الشخصي.", potential_savings:"الادخارات الشهرية المحتملة", opportunity:"فرصة", opportunities:"فرص", based_on_ops:"بناءً على", identified:"فرص محددة", financial_health:"الصحة المالية", financial_insights:"الرؤى المالية", financial_insights_desc:"تحليل شخصي لأنماط إنفاقك", recommendations:"التوصيات", recommendations_desc:"خطوات عملية لتحسين وضعك المالي", spending_patterns:"أنماط الإنفاق", spending_patterns_desc:"الاتجاهات الملاحظة في سجل معاملاتك",
        avg_monthly:"متوسط الإنفاق الشهري", based_last_7:"استناداً إلى آخر 7 أشهر", highest_category:"أعلى فئة", this_month:"هذا الشهر", no_expenses_month:"لا توجد نفقات هذا الشهر", of_monthly_income:"من الدخل الشهري",
        category_breakdown:"تفصيل حسب الفئة", where_money_goes:"أين تذهب أموالك", no_expense_data:"لا توجد بيانات نفقات هذا الشهر",
        weekly_comparison:"المقارنة الأسبوعية", this_month_label:"هذا الشهر", vs_label:"مقابل", last_month_label:"الشهر الماضي", avg_this_month:"متوسط هذا الشهر", avg_last_month:"متوسط الشهر الماضي",
        spending_trend:"اتجاه الإنفاق", monthly_patterns:"أنماط الإنفاق الشهري",
        income_vs_expenses:"الدخل مقابل النفقات", track_health:"تتبع صحتك المالية", no_data_period:"لا تتوفر بيانات لهذه الفترة",
        col_category:"الفئة", col_type:"النوع", col_date:"التاريخ", col_status:"الحالة", col_amount:"المبلغ", col_actions:"الإجراءات", tx_completed:"مكتمل", edit:"تعديل", save_changes_btn:"حفظ التغييرات",
        avg_daily_spending:"متوسط الإنفاق اليومي", top_category:"أعلى فئة", avg_transaction:"متوسط المعاملة", per_expense_month:"لكل مصروف هذا الشهر",
        recent_transactions:"المعاملات الأخيرة", view_all:"عرض الكل", latest_activity:"آخر نشاطاتك", no_transactions_yet:"لا توجد معاملات بعد",
        key_insights:"الرؤى الرئيسية", no_insights_available:"لا توجد رؤى متاحة",
        last_6_months:"آخر 6 أشهر",
        edit_transaction:"تعديل المعاملة", amount_label:"المبلغ", select_category_placeholder:"اختر الفئة", description_optional:"الوصف (اختياري)", processing:"جار المعالجة...", update_transaction:"تحديث المعاملة",
        year_over_year_title:"مقارنة سنة بسنة", monthly_expenses_subtitle:"المصاريف الشهرية:",
        vs_last_month:"مقابل الشهر الماضي",
        no_notifications_yet:"لا توجد إشعارات بعد", just_now:"الآن", min_ago:" د", hour_ago:" س", day_ago:" ي",
    },
    Albanian: {
        // Nav
        dashboard:"Paneli", transactions:"Transaksionet", analytics:"Analitikë", budgets:"Buxhetet", insights:"Njohuri", settings:"Cilësimet", logout:"Dilni",
        // Dashboard
        welcome:"Mirë se u kthyet", finances_today:"Ja çfarë po ndodh me financat tuaja sot.", total_balance:"Bilanci Total", monthly_spending:"Shpenzimet Mujore", savings_rate:"Norma e Kursimeve", budget_status:"Gjendja e Buxhetit",
        // Transactions
        track_manage:"Gjurmoni dhe menaxhoni të gjitha shpenzimet tuaja", add_transaction:"+ Shto Transaksion", export:"Eksporto", search:"Kërko transaksione...", all:"Të gjitha", income:"Të ardhura", expense:"Shpenzim", all_categories:"Të gjitha Kategoritë", delete_transaction:"Fshi Transaksionin", delete_tx_confirm:"Jeni të sigurt që doni të fshini këtë transaksion? Ky veprim nuk mund të zhbëhet.", cancel:"Anulo", delete:"Fshi",
        // Analytics
        deep_dive:"Zhytuni thellë në modelet e shpenzimeve tuaja", range_7d:"7 Ditë", range_1m:"1 Muaj", range_3m:"3 Muaj", range_6m:"6 Muaj", range_1y:"1 Vit", loading:"Duke ngarkuar...", no_data:"Nuk ka të dhëna",
        // Budgets
        set_track:"Vendosni dhe gjurmoni kufijtë e shpenzimeve", add_budget:"Shto Buxhet", total_budget:"Buxheti Total", for_this_month:"Për këtë muaj", total_spent:"Totali i Shpenzuar", pct_of_budget:"% e buxhetit", remaining_label:"Mbetur", available_to_spend:"Disponibël për shpenzim", no_budgets:"Nuk ka buxhete", no_budgets_desc:"Klikoni \"+ Shto Buxhet\" për të krijuar kufirin tuaj të parë.", pct_used:"% e përdorur", left:"mbetur", approaching_limit:"Po i afroheni kufirit të buxhetit tuaj", edit_budget:"Ndrysho Buxhetin", add_budget_modal:"Shto Buxhet", category_label:"Kategoria", budget_limit:"Kufiri i Buxhetit", period_label:"Periudha", weekly:"Javor", monthly:"Mujor", yearly:"Vjetor", saving:"Duke ruajtur…", save_changes:"Ruaj Ndryshimet", create_budget:"Krijo Buxhet",
        // Settings
        manage_account:"Menaxhoni llogarinë dhe preferencat tuaja", appearance:"Pamja", dark_mode:"Modaliteti i Errët", toggle_dark:"Ndrysho skemën e ngjyrave të errëta", currency_label:"Monedha", language_label:"Gjuha", member_since:"Anëtar që nga", profile_info:"Informacioni i Profilit", full_name:"Emri i Plotë", name_placeholder:"Emri juaj", email_address:"Adresa e Email-it", change_password:"Ndrysho Fjalëkalimin", password_hint:"Përdorni një fjalëkalim të paktën 6 karaktere", current_password:"Fjalëkalimi Aktual", new_password:"Fjalëkalimi i Ri", confirm_password:"Konfirmo Fjalëkalimin e Ri", updating:"Duke përditësuar…", update_password:"Përditëso Fjalëkalimin", danger_zone:"Zona e Rrezikut", danger_zone_desc:"Fshini përgjithmonë llogarinë dhe të gjitha të dhënat", delete_account:"Fshi Llogarinë", delete_warning:"Kjo do të fshijë përgjithmonë llogarinë, të gjitha transaksionet dhe buxhetet. Ky veprim nuk mund të zhbëhet.", confirm_your_password:"Konfirmo fjalëkalimin tuaj", type_delete:"Shkruani FSHI për të konfirmuar", deleting:"Duke fshirë…", permanently_delete:"Fshi Llogarinë Përgjithmonë",
        // Insights
        ai_powered:"Analizë financiare e fuqizuar nga AI", ask_placeholder:"Bëni një pyetje specifike (opsionale)…", analyzing:"Duke analizuar…", refresh:"Rifresko", generate_insights:"Gjenero Njohuri", no_insights_title:"Ende nuk ka njohuri", no_insights_desc:"Klikoni \"Gjenero Njohuri\" për të marrë analizën tuaj financiare të personalizuar.", potential_savings:"Kursimet e Mundshme Mujore", opportunity:"mundësi", opportunities:"mundësi", based_on_ops:"Bazuar në", identified:"të identifikuara", financial_health:"Shëndeti Financiar", financial_insights:"Njohuri Financiare", financial_insights_desc:"Analizë e personalizuar e modeleve të shpenzimeve tuaja", recommendations:"Rekomandimet", recommendations_desc:"Hapa konkretë për të përmirësuar financat tuaja", spending_patterns:"Modelet e Shpenzimeve", spending_patterns_desc:"Tendencat e vërejtura në historikun e transaksioneve tuaja",
        // Components
        avg_monthly:"Mesatarja e Shpenzimeve Mujore", based_last_7:"Bazuar në 7 muajt e fundit", highest_category:"Kategoria më e Lartë", this_month:"këtë muaj", no_expenses_month:"Nuk ka shpenzime këtë muaj", of_monthly_income:"E të ardhurave mujore",
        category_breakdown:"Ndarja sipas Kategorisë", where_money_goes:"Ku shkojnë paratë tuaja", no_expense_data:"Nuk ka të dhëna shpenzimesh këtë muaj",
        weekly_comparison:"Krahasimi Javor", this_month_label:"Këtë muaj", vs_label:"kundrejt", last_month_label:"muajin e kaluar", avg_this_month:"Mesatarja Këtë Muaj", avg_last_month:"Mesatarja Muajin e Kaluar",
        spending_trend:"Tendenca e Shpenzimeve", monthly_patterns:"Modelet mujore të shpenzimeve",
        income_vs_expenses:"Të ardhurat kundrejt Shpenzimeve", track_health:"Gjurmoni shëndetin tuaj financiar", no_data_period:"Nuk ka të dhëna për këtë periudhë",
        col_category:"Kategoria", col_type:"Lloji", col_date:"Data", col_status:"Statusi", col_amount:"Shuma", col_actions:"Veprimet", tx_completed:"Përfunduar", edit:"Ndrysho", save_changes_btn:"Ruaj Ndryshimet",
        avg_daily_spending:"Mesatarja e Shpenzimeve Ditore", top_category:"Kategoria Kryesore", avg_transaction:"Transaksioni Mesatar", per_expense_month:"për shpenzim këtë muaj",
        recent_transactions:"Transaksionet e Fundit", view_all:"Shiko Të Gjitha", latest_activity:"Aktiviteti juaj i fundit", no_transactions_yet:"Ende nuk ka transaksione",
        key_insights:"Njohuri Kyçe", no_insights_available:"Nuk ka njohuri të disponueshme",
        last_6_months:"6 muajt e fundit",
        edit_transaction:"Ndrysho Transaksionin", amount_label:"Shuma", select_category_placeholder:"Zgjidh kategorinë", description_optional:"Përshkrim (opsional)", processing:"Duke procesuar...", update_transaction:"Përditëso Transaksionin",
        year_over_year_title:"Krahasimi Vit pas Viti", monthly_expenses_subtitle:"Shpenzimet mujore:",
        vs_last_month:"kundrejt muajit të kaluar",
        no_notifications_yet:"Ende nuk ka njoftim", just_now:"tani", min_ago:" min", hour_ago:" orë", day_ago:" ditë",
    },
};


type AppearanceContextType = {
    darkMode: boolean; setDarkMode: (v: boolean) => void;
    currency: string; setCurrency: (v: string) => void;
    language: string; setLanguage: (v: string) => void;
    fmt: (n: number) => string;
    t: (key: string) => string;
};

const AppearanceContext = createContext<AppearanceContextType>({
    darkMode: false, setDarkMode: () => {},
    currency: "EUR (€)", setCurrency: () => {},
    language: "English", setLanguage: () => {},
    fmt: (n) => `€${n.toFixed(2)}`,
    t: (k) => k,
});

export const useAppearance = () => useContext(AppearanceContext);

const load = () => { try { return JSON.parse(localStorage.getItem("appearance") || "{}"); } catch { return {}; } };

export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
    const saved = load();
    const [darkMode, setDarkModeState] = useState<boolean>(saved.darkMode ?? false);
    const [currency, setCurrencyState] = useState<string>(saved.currency ?? "EUR (€)");
    const [language, setLanguageState] = useState<string>(saved.language ?? "English");

    const persist = (patch: object) =>
        localStorage.setItem("appearance", JSON.stringify({ darkMode, currency, language, ...patch }));

    const setDarkMode = (v: boolean) => {
        setDarkModeState(v);
        persist({ darkMode: v });
        document.documentElement.classList.toggle("dark", v);
    };
    const setCurrency = (v: string) => { setCurrencyState(v); persist({ currency: v }); };
    const setLanguage = (v: string) => { setLanguageState(v); persist({ language: v }); };

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const fmt = (n: number): string => {
        const code = getCurrencyCode(currency);
        try { return n.toLocaleString("en-US", { style: "currency", currency: code, maximumFractionDigits: 2 }); }
        catch { return `$${n.toFixed(2)}`; }
    };

    const t = (key: string): string => T[language]?.[key] ?? T["English"]?.[key] ?? key;

    return (
        <AppearanceContext.Provider value={{ darkMode, setDarkMode, currency, setCurrency, language, setLanguage, fmt, t }}>
            {children}
        </AppearanceContext.Provider>
    );
};
