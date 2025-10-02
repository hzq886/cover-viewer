export type LanguageCode = "zh-CN" | "zh-TW" | "ja" | "en";

type Feature = {
  title: string;
  description: string;
};

export const LANGUAGE_DISPLAY_NAMES: Record<LanguageCode, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
  en: "English",
};

type TranslationShape = {
  languageSwitcher: {
    label: string;
    ariaLabel: string;
    optionAria: string;
  };
  languages: Record<LanguageCode, string>;
  authBar: {
    loading: string;
    login: string;
    myPage: string;
    logout: string;
    menuAria: string;
  };
  login: {
    title: string;
    description: string;
    missingConfig: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    submitting: string;
    sentNotice: string;
    sentHelp: string;
    backToHome: string;
  };
  search: {
    placeholder: {
      default: string;
      compact: string;
    };
    clear: string;
    submit: string;
    submitTitle: string;
    submitCompactAria: string;
    deleteRecent: string;
    noRecent: string;
  };
  logo: {
    homeAria: string;
  };
  hero: {
    badge: string;
    heading1: string;
    heading2: string;
    description: string;
    emphasis: string;
    features: Feature[];
  };
  page: {
    noResults: string;
  };
  infoPanel: {
    contentId: string;
    maker: string;
    director: string;
    releaseDate: string;
    play: string;
    playAria: string;
    imageSize: string;
    stageSize: string;
    remaining: string;
  };
  sample: {
    front: string;
    back: string;
    view: string;
    more: string;
    backToTop: string;
  };
  video: {
    close: string;
  };
  errors: {
    searchFailed: string;
    missingKeyword: string;
    serverMissingConfig: string;
    dmmApi: string;
    timeout: string;
    unknown: string;
  };
};

export const translations: Record<LanguageCode, TranslationShape> = {
  "zh-CN": {
    languageSwitcher: {
      label: "语言",
      ariaLabel: "选择界面语言",
      optionAria: "切换为{{language}}",
    },
    languages: LANGUAGE_DISPLAY_NAMES,
    authBar: {
      loading: "认证中…",
      login: "登录",
      myPage: "个人主页",
      logout: "退出登录",
      menuAria: "打开个人菜单",
    },
    login: {
      title: "登录",
      description: "使用邮箱登录（无密码）。我们会发送一封带有登录链接的邮件。",
      missingConfig:
        "Firebase 配置未设置。请参考 README 的“登录（Firebase 邮件链接）”部分。",
      emailLabel: "邮箱",
      emailPlaceholder: "you@example.com",
      submit: "发送登录链接",
      submitting: "发送中…",
      sentNotice: "登录链接已发送至 {{email}}。请在邮件中点击链接完成登录。",
      sentHelp: "收到邮件后，直接在本设备打开即可自动完成登录。",
      backToHome: "返回首页",
    },
    search: {
      placeholder: {
        default: "输入任意关键词(多个关键词用空格隔开)",
        compact: "继续检索关键词",
      },
      clear: "清除搜索内容",
      submit: "搜索",
      submitTitle: "搜索",
      submitCompactAria: "执行搜索",
      deleteRecent: "删除 '{{value}}'",
      noRecent: "暂无搜索历史",
    },
    logo: {
      homeAria: "返回首页",
    },
    hero: {
      badge: "今日幸运AV",
      heading1: "输入任意关键词，随机获取一张今日幸运AV封面",
      heading2: "来试试手气吧！",
      description: "支持分类、番号、演员、导演、制作商、标题任意关键词。",
      emphasis: "要是不满意结果，试试按搜索键再抽一次！",
      features: [
        {
          title: "不只是封面！",
          description: "右侧预览图包含更多视频截图",
        },
        {
          title: "放大大图！",
          description: "点击中央海报可放大截图",
        },
        {
          title: "动起来！",
          description: "左侧播放按钮可观赏样片",
        },
        {
          title: "商品详情！",
          description: "点击影片标题可以跳转购买页面",
        },
      ],
    },
    page: {
      noResults: "未找到相关海报，请更换关键词再试。",
    },
    infoPanel: {
      contentId: "番号:",
      maker: "厂商:",
      director: "导演:",
      releaseDate: "发布日期:",
      play: "播放样片",
      playAria: "播放样片",
      imageSize: "图片实际分辨率: {{value}}",
      stageSize: "显示区域尺寸: {{value}}",
      remaining: "当前关键词剩余数量: {{count}}",
    },
    sample: {
      front: "封面",
      back: "封底",
      view: "查看样张",
      more: "更多",
      backToTop: "返回上方",
    },
    video: {
      close: "关闭",
    },
    errors: {
      searchFailed: "搜索失败，请稍后重试。",
      missingKeyword: "请输入关键词后再搜索。",
      serverMissingConfig: "服务器缺少必要的 DMM 配置。",
      dmmApi: "上游 DMM API 返回错误 ({{status}})。",
      timeout: "请求 DMM API 超时，请稍后再试。",
      unknown: "发生未知错误，请稍后再试。",
    },
  },
  "zh-TW": {
    languageSwitcher: {
      label: "語言",
      ariaLabel: "選擇介面語言",
      optionAria: "切換為{{language}}",
    },
    languages: LANGUAGE_DISPLAY_NAMES,
    authBar: {
      loading: "驗證中…",
      login: "登入",
      myPage: "我的頁面",
      logout: "登出",
      menuAria: "開啟個人選單",
    },
    login: {
      title: "登入",
      description:
        "使用電子郵件登入（免密碼）。我們會寄送一封附有登入連結的信件。",
      missingConfig:
        "Firebase 設定尚未完成。請參考 README 的「登入（Firebase 郵件連結）」段落。",
      emailLabel: "電子郵件",
      emailPlaceholder: "you@example.com",
      submit: "寄送登入連結",
      submitting: "寄送中…",
      sentNotice: "登入連結已寄送到 {{email}}，請點擊郵件中的連結完成登入。",
      sentHelp: "收到信件後，在同一裝置開啟即可自動完成登入。",
      backToHome: "返回首頁",
    },
    search: {
      placeholder: {
        default: "輸入任意關鍵字（多個關鍵字以空格分隔）",
        compact: "繼續搜尋其他關鍵字",
      },
      clear: "清除搜尋內容",
      submit: "搜尋",
      submitTitle: "搜尋",
      submitCompactAria: "執行搜尋",
      deleteRecent: "刪除『{{value}}』",
      noRecent: "尚無搜尋歷史",
    },
    logo: {
      homeAria: "返回首頁",
    },
    hero: {
      badge: "今日幸運AV",
      heading1: "輸入任意關鍵字，隨機抽出一張今日幸運AV封面",
      heading2: "來試試手氣吧！",
      description: "支援分類、番號、演員、導演、製作商、標題等任意關鍵字。",
      emphasis: "不滿意結果？再按一次搜尋鍵重新抽卡！",
      features: [
        {
          title: "不只看封面！",
          description: "右側預覽欄提供更多影片截圖",
        },
        {
          title: "放大欣賞！",
          description: "點擊中央海報即可放大檢視",
        },
        {
          title: "影音也有！",
          description: "左側播放鍵可觀賞試看影片",
        },
        {
          title: "商品詳情！",
          description: "點擊片名即可前往購買頁面",
        },
      ],
    },
    page: {
      noResults: "找不到相關海報，請換個關鍵字再試。",
    },
    infoPanel: {
      contentId: "番號:",
      maker: "廠商:",
      director: "導演:",
      releaseDate: "發售日:",
      play: "播放試看",
      playAria: "播放試看",
      imageSize: "圖片實際解析度: {{value}}",
      stageSize: "顯示區域尺寸: {{value}}",
      remaining: "此關鍵字剩餘數量: {{count}}",
    },
    sample: {
      front: "封面",
      back: "封底",
      view: "檢視樣張",
      more: "更多",
      backToTop: "回到上方",
    },
    video: {
      close: "關閉",
    },
    errors: {
      searchFailed: "搜尋失敗，請稍候再試。",
      missingKeyword: "請先輸入關鍵字再搜尋。",
      serverMissingConfig: "伺服器缺少必要的 DMM 設定。",
      dmmApi: "上游 DMM API 回傳錯誤 ({{status}})。",
      timeout: "請求 DMM API 逾時，請稍後再試。",
      unknown: "發生未知錯誤，請稍後再試。",
    },
  },
  ja: {
    languageSwitcher: {
      label: "言語",
      ariaLabel: "表示言語を選択する",
      optionAria: "{{language}}に切り替える",
    },
    languages: LANGUAGE_DISPLAY_NAMES,
    authBar: {
      loading: "認証中…",
      login: "ログイン",
      myPage: "マイページ",
      logout: "ログアウト",
      menuAria: "プロフィールメニューを開く",
    },
    login: {
      title: "ログイン",
      description:
        "メールアドレスでログインします（パスワード不要）。サインイン用リンクをお送りします。",
      missingConfig:
        "Firebase の設定が未完了です。README の「ログイン（Firebase メールリンク）」をご確認ください。",
      emailLabel: "メールアドレス",
      emailPlaceholder: "you@example.com",
      submit: "サインインリンクを送信",
      submitting: "送信中…",
      sentNotice:
        "サインインリンクを {{email}} に送信しました。メール内のリンクからログインしてください。",
      sentHelp:
        "メールを受信した端末でリンクを開くと、そのままログインが完了します。",
      backToHome: "トップへ戻る",
    },
    search: {
      placeholder: {
        default: "キーワードを入力してください（複数はスペース区切り）",
        compact: "別のキーワードで再検索",
      },
      clear: "検索語をクリア",
      submit: "検索",
      submitTitle: "検索",
      submitCompactAria: "検索を実行",
      deleteRecent: "『{{value}}』を削除",
      noRecent: "検索履歴はありません",
    },
    logo: {
      homeAria: "トップに戻る",
    },
    hero: {
      badge: "本日のラッキーAV",
      heading1: "お好みのキーワードで本日のラッキーAVジャケットをランダム表示",
      heading2: "運試ししてみましょう！",
      description:
        "ジャンル、品番、出演者、監督、メーカー、タイトルなど自由に検索できます。",
      emphasis: "気に入らなければ検索ボタンでもう一度引き直せます！",
      features: [
        {
          title: "ジャケットだけじゃない！",
          description: "右側のプレビューで追加のスチルを確認",
        },
        {
          title: "拡大表示！",
          description: "中央のジャケットをクリックすると拡大",
        },
        {
          title: "動画もチェック！",
          description: "左側の再生ボタンでサンプル動画を再生",
        },
        {
          title: "詳細情報へ！",
          description: "作品タイトルをクリックすると購入ページへ移動",
        },
      ],
    },
    page: {
      noResults:
        "該当するジャケットが見つかりませんでした。キーワードを変更して再度お試しください。",
    },
    infoPanel: {
      contentId: "品番:",
      maker: "メーカー:",
      director: "監督:",
      releaseDate: "発売日:",
      play: "サンプル動画を再生",
      playAria: "サンプル動画を再生",
      imageSize: "画像解像度: {{value}}",
      stageSize: "表示エリアサイズ: {{value}}",
      remaining: "このキーワードの残り候補: {{count}}",
    },
    sample: {
      front: "表面",
      back: "裏面",
      view: "サンプルを見る",
      more: "もっと見る",
      backToTop: "上へ戻る",
    },
    video: {
      close: "閉じる",
    },
    errors: {
      searchFailed: "検索に失敗しました。時間をおいて再度お試しください。",
      missingKeyword: "検索するキーワードを入力してください。",
      serverMissingConfig: "サーバーに必要な DMM 設定がありません。",
      dmmApi: "DMM API がエラーを返しました ({{status}})。",
      timeout: "DMM API の応答がタイムアウトしました。",
      unknown: "不明なエラーが発生しました。時間をおいて再度お試しください。",
    },
  },
  en: {
    languageSwitcher: {
      label: "Language",
      ariaLabel: "Select interface language",
      optionAria: "Switch to {{language}}",
    },
    languages: LANGUAGE_DISPLAY_NAMES,
    authBar: {
      loading: "Authenticating…",
      login: "Login",
      myPage: "My Page",
      logout: "Logout",
      menuAria: "Open profile menu",
    },
    login: {
      title: "Login",
      description:
        "Sign in with your email (no password needed). We'll send a message with your sign-in link.",
      missingConfig:
        "Firebase isn't configured yet. See the README section “Login (Firebase email link)”.",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      submit: "Send sign-in link",
      submitting: "Sending…",
      sentNotice:
        "We've sent a sign-in link to {{email}}. Open the email and tap the link to finish logging in.",
      sentHelp:
        "If you open the email on this device, the link will sign you in automatically.",
      backToHome: "Back to home",
    },
    search: {
      placeholder: {
        default: "Enter any keyword (use spaces to separate multiple keywords)",
        compact: "Search with another keyword",
      },
      clear: "Clear search input",
      submit: "Search",
      submitTitle: "Search",
      submitCompactAria: "Run search",
      deleteRecent: "Remove '{{value}}'",
      noRecent: "No recent searches yet",
    },
    logo: {
      homeAria: "Go back to home",
    },
    hero: {
      badge: "Lucky AV of the Day",
      heading1: "Enter a keyword to draw a random AV cover for today",
      heading2: "Give it a spin!",
      description:
        "Search by category, SKU, actress, director, studio, or any title keyword.",
      emphasis: "Not happy with the result? Hit search again for a new draw!",
      features: [
        {
          title: "More than covers",
          description: "Preview column shows additional screenshots",
        },
        {
          title: "Zoom in",
          description: "Click the main poster to view it in large size",
        },
        {
          title: "Bring it to life",
          description: "Use the play button to watch the sample clip",
        },
        {
          title: "Product details",
          description: "Click the title to open the purchase page",
        },
      ],
    },
    page: {
      noResults: "No posters found. Try another keyword.",
    },
    infoPanel: {
      contentId: "SKU:",
      maker: "Studio:",
      director: "Director:",
      releaseDate: "Release date:",
      play: "Play sample",
      playAria: "Play sample",
      imageSize: "Image resolution: {{value}}",
      stageSize: "Display stage size: {{value}}",
      remaining: "Remaining results for this keyword: {{count}}",
    },
    sample: {
      front: "Front",
      back: "Back",
      view: "View sample",
      more: "More",
      backToTop: "Back to top",
    },
    video: {
      close: "Close",
    },
    errors: {
      searchFailed: "Search failed. Please try again in a moment.",
      missingKeyword: "Enter a keyword before searching.",
      serverMissingConfig: "Server is missing required DMM configuration.",
      dmmApi: "Upstream DMM API returned an error ({{status}}).",
      timeout: "Request to DMM API timed out. Please try again.",
      unknown: "An unknown error occurred. Please try again later.",
    },
  },
};

export type TranslationDictionary = (typeof translations)["zh-CN"];

export const SUPPORTED_LANGUAGES: LanguageCode[] = [
  "zh-CN",
  "zh-TW",
  "ja",
  "en",
];
