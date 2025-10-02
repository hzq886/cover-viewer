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
  auth: {
    promptEmail: string;
    emailRequired: string;
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
  myPage: {
    backToHome: string;
    posterLabel: string;
    loginRequiredTitle: string;
    loginRequiredDescription: string;
    loginRequiredCta: string;
    emptyTitle: string;
    emptyDescription: string;
    pageIndicator: string;
    deleteAria: string;
    deleteFailure: string;
    imageMissing: string;
    buy: string;
    watch: string;
    checkingVideo: string;
    videoNotFound: string;
    prevPage: string;
    nextPage: string;
    posterAlt: string;
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
    keywordPanel: {
      open: string;
      title: string;
      close: string;
    };
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
    activate: string;
    activateAria: string;
    previewAlt: string;
    backToPreview: string;
    back: string;
  };
  posterPanel: {
    openFullscreen: string;
    openFullscreenAria: string;
    previous: string;
    next: string;
    goTo: string;
    currentAlt: string;
    previousAlt: string;
  };
  zoomModal: {
    closeAria: string;
    previousAlt: string;
    currentAlt: string;
  };
  comment: {
    placeholderLiked: string;
    placeholderEmpty: string;
    placeholderDefault: string;
    noComments: string;
    addLabel: string;
    submit: string;
    submitting: string;
    likeAria: string;
    unlikeAria: string;
  };
  portal: {
    title: string;
    subtitle: string;
    subtitleFallback: string;
    redirecting: string;
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
    auth: {
      promptEmail: "请输入邮箱以完成登录。",
      emailRequired: "需要提供邮箱才能完成登录。",
    },
    myPage: {
      backToHome: "返回首页",
      posterLabel: "收藏海报",
      loginRequiredTitle: "需要登录以查看私人藏册",
      loginRequiredDescription:
        "登录后，我们会为你的专属海报建立一整册收藏夹。每张海报会记录保养痕迹，随时能翻阅与管理。",
      loginRequiredCta: "前往登录",
      emptyTitle: "还没有收藏",
      emptyDescription: "回到首页点个喜欢，海报就会自动收藏到这里。",
      pageIndicator: "第 {{current}} / {{total}} 页",
      deleteAria: "删除海报",
      deleteFailure: "删除海报失败",
      imageMissing: "图像缺失",
      buy: "购买",
      watch: "观看",
      checkingVideo: "检测中…",
      videoNotFound: "未能找到对应的视频链接",
      prevPage: "上一页",
      nextPage: "下一页",
      posterAlt: "收藏海报预览",
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
      keywordPanel: {
        open: "打开关键词面板",
        title: "关键词",
        close: "关闭关键词面板",
      },
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
      activate: "点击播放视频",
      activateAria: "开启视频预览",
      previewAlt: "视频预览图",
      backToPreview: "返回图片预览",
      back: "返回",
    },
    posterPanel: {
      openFullscreen: "打开全屏预览",
      openFullscreenAria: "在全屏中查看媒体",
      previous: "上一项",
      next: "下一项",
      goTo: "跳转到第 {{index}} 张",
      currentAlt: "媒体预览",
      previousAlt: "上一张媒体预览",
    },
    zoomModal: {
      closeAria: "关闭放大预览",
      previousAlt: "上一张放大图",
      currentAlt: "放大的媒体",
    },
    comment: {
      placeholderLiked: "留下你的想法...",
      placeholderEmpty: "抢个沙发吧",
      placeholderDefault: "写点什么",
      noComments: "还没有评论，快来抢个沙发。",
      addLabel: "添加评论",
      submit: "发送",
      submitting: "发送中",
      likeAria: "点个喜欢",
      unlikeAria: "取消喜欢",
    },
    portal: {
      title: "奥术传送门",
      subtitle: "远古符文正在追寻 {{code}} 的踪迹…",
      subtitleFallback: "远古符文正在倾听未知的呼唤…",
      redirecting: "5 秒后传送至目标领域",
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
    auth: {
      promptEmail: "請輸入電子郵件以完成登入。",
      emailRequired: "需要提供電子郵件才能完成登入。",
    },
    myPage: {
      backToHome: "返回首頁",
      posterLabel: "收藏海報",
      loginRequiredTitle: "需要登入才可查看私人收藏",
      loginRequiredDescription:
        "登入後，我們會為你的海報建立專屬收藏冊，每一張都能隨時整理與回顧。",
      loginRequiredCta: "前往登入",
      emptyTitle: "尚未收藏",
      emptyDescription: "回到首頁按下喜歡，海報就會自動收藏到這裡。",
      pageIndicator: "第 {{current}} / {{total}} 頁",
      deleteAria: "刪除海報",
      deleteFailure: "刪除海報失敗",
      imageMissing: "缺少圖像",
      buy: "購買",
      watch: "觀看",
      checkingVideo: "檢查中…",
      videoNotFound: "找不到對應的影片連結",
      prevPage: "上一頁",
      nextPage: "下一頁",
      posterAlt: "收藏海報預覽",
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
      keywordPanel: {
        open: "開啟關鍵字面板",
        title: "關鍵字",
        close: "關閉關鍵字面板",
      },
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
      activate: "點擊播放影片",
      activateAria: "開啟影片預覽",
      previewAlt: "影片預覽圖",
      backToPreview: "返回圖片預覽",
      back: "返回",
    },
    posterPanel: {
      openFullscreen: "開啟全螢幕預覽",
      openFullscreenAria: "在全螢幕中查看媒體",
      previous: "上一個",
      next: "下一個",
      goTo: "跳至第 {{index}} 張",
      currentAlt: "媒體預覽",
      previousAlt: "上一張媒體預覽",
    },
    zoomModal: {
      closeAria: "關閉放大預覽",
      previousAlt: "上一張放大圖",
      currentAlt: "放大的媒體",
    },
    comment: {
      placeholderLiked: "留下你的想法...",
      placeholderEmpty: "搶個沙發吧",
      placeholderDefault: "寫點什麼",
      noComments: "還沒有留言，快來搶個沙發。",
      addLabel: "新增留言",
      submit: "送出",
      submitting: "送出中",
      likeAria: "點個喜歡",
      unlikeAria: "取消喜歡",
    },
    portal: {
      title: "奧術傳送門",
      subtitle: "遠古符文正在追尋 {{code}} 的足跡…",
      subtitleFallback: "遠古符文正在傾聽未知的呼喚…",
      redirecting: "5 秒後傳送至目的領域",
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
    auth: {
      promptEmail: "ログインを完了するにはメールアドレスを入力してください。",
      emailRequired: "ログインを完了するにはメールアドレスが必要です。",
    },
    myPage: {
      backToHome: "トップに戻る",
      posterLabel: "コレクション",
      loginRequiredTitle: "ログインするとコレクションを閲覧できます",
      loginRequiredDescription:
        "ログイン後は、お気に入りのジャケットを集めた専用アルバムが作成されます。いつでも見返して管理できます。",
      loginRequiredCta: "ログインへ",
      emptyTitle: "まだお気に入りがありません",
      emptyDescription:
        "トップで「いいね」を押すと、ここに自動でコレクションされます。",
      pageIndicator: "{{current}} / {{total}} ページ",
      deleteAria: "ジャケットを削除",
      deleteFailure: "ジャケットの削除に失敗しました",
      imageMissing: "画像がありません",
      buy: "購入",
      watch: "再生",
      checkingVideo: "確認中…",
      videoNotFound: "対応する動画を見つけられませんでした",
      prevPage: "前へ",
      nextPage: "次へ",
      posterAlt: "コレクションのジャケット",
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
      keywordPanel: {
        open: "キーワードパネルを開く",
        title: "キーワード",
        close: "キーワードパネルを閉じる",
      },
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
      activate: "動画を再生する",
      activateAria: "動画プレビューを開く",
      previewAlt: "動画プレビュー",
      backToPreview: "画像プレビューに戻る",
      back: "戻る",
    },
    posterPanel: {
      openFullscreen: "全画面で表示",
      openFullscreenAria: "メディアを全画面で表示",
      previous: "前へ",
      next: "次へ",
      goTo: "{{index}} 枚目へ移動",
      currentAlt: "メディアプレビュー",
      previousAlt: "前のメディアプレビュー",
    },
    zoomModal: {
      closeAria: "拡大表示を閉じる",
      previousAlt: "前の拡大表示",
      currentAlt: "拡大表示",
    },
    comment: {
      placeholderLiked: "感想を残しましょう…",
      placeholderEmpty: "最初のコメントをどうぞ",
      placeholderDefault: "コメントを書く",
      noComments: "まだコメントがありません。最初の一言をどうぞ。",
      addLabel: "コメントを追加",
      submit: "送信",
      submitting: "送信中…",
      likeAria: "いいねする",
      unlikeAria: "いいねを取り消す",
    },
    portal: {
      title: "古の転移門",
      subtitle: "悠久のルーンが {{code}} の座標を探知中…",
      subtitleFallback: "悠久のルーンが未知の囁きを聞き取っています…",
      redirecting: "五秒後に転移を開始します",
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
    auth: {
      promptEmail: "Enter your email to finish signing in.",
      emailRequired: "Your email is required to complete sign-in.",
    },
    myPage: {
      backToHome: "Back to home",
      posterLabel: "Posters",
      loginRequiredTitle: "Sign in to view your collection",
      loginRequiredDescription:
        "After signing in, we'll build a private album for every cover you like so you can revisit and manage them anytime.",
      loginRequiredCta: "Go to login",
      emptyTitle: "No favorites yet",
      emptyDescription:
        "Head back to the home page and like a cover to see it here.",
      pageIndicator: "Page {{current}} / {{total}}",
      deleteAria: "Remove cover",
      deleteFailure: "Failed to remove cover",
      imageMissing: "Image unavailable",
      buy: "Buy",
      watch: "Watch",
      checkingVideo: "Checking…",
      videoNotFound: "Could not find the matching video",
      prevPage: "Previous",
      nextPage: "Next",
      posterAlt: "Collected cover preview",
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
      keywordPanel: {
        open: "Open keyword panel",
        title: "Keywords",
        close: "Close keyword panel",
      },
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
      activate: "Play the sample video",
      activateAria: "Activate video preview",
      previewAlt: "Video preview",
      backToPreview: "Back to image preview",
      back: "Back",
    },
    posterPanel: {
      openFullscreen: "Open fullscreen preview",
      openFullscreenAria: "View media in fullscreen",
      previous: "Previous",
      next: "Next",
      goTo: "Go to slide {{index}}",
      currentAlt: "Media preview",
      previousAlt: "Previous media preview",
    },
    zoomModal: {
      closeAria: "Close zoomed viewer",
      previousAlt: "Previous zoomed media",
      currentAlt: "Zoomed media",
    },
    comment: {
      placeholderLiked: "Share what you think…",
      placeholderEmpty: "Be the first to comment",
      placeholderDefault: "Type something",
      noComments: "No comments yet—be the first to say something.",
      addLabel: "Add comment",
      submit: "Send",
      submitting: "Sending…",
      likeAria: "Like this cover",
      unlikeAria: "Remove like",
    },
    portal: {
      title: "Arcane Gate",
      subtitle: "Ancient sigils hunt for the trail of {{code}}…",
      subtitleFallback: "Ancient sigils heed an unnamed summons…",
      redirecting: "Teleporting in 5 heartbeats",
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
