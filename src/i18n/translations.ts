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
  signInEmail: {
    subject: string;
    previewText: string;
    greeting: string;
    intro: string;
    button: string;
    fallbackIntro: string;
    expiry: string;
    ignore: string;
    closing: string;
    signature: string;
    footer: string;
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
    signInEmail: {
      subject: "欢迎登入 Lucky JAV",
      previewText: "使用这封邮件完成 Lucky JAV 的安全登录。",
      greeting: "您好，",
      intro:
        "您刚刚在 Lucky JAV 提交了邮箱登录请求。请点击下方按钮完成身份验证：",
      button: "立即登录 Lucky JAV",
      fallbackIntro: "如果按钮无法打开，请将以下链接复制到浏览器地址栏：",
      expiry:
        "为了保护您的账号安全，此链接将在 15 分钟后失效，并且仅适用于本次请求。",
      ignore: "若非您本人操作，请直接忽略此邮件，我们不会继续处理。",
      closing: "祝您使用愉快，感谢信任 Lucky JAV！",
      signature: "Lucky JAV 团队 敬上",
      footer: "此邮件由系统自动发送，请勿直接回复。",
    },
    myPage: {
      backToHome: "返回首页",
      posterLabel: "收藏海报",
      loginRequiredTitle: "需要登录以查看私人藏册",
      loginRequiredCta: "前往登录",
      emptyTitle: "还没有收藏",
      emptyDescription: "点个赞，海报就会自动收藏到这里。",
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
      badge: "好运AV",
      heading1: "任意关键词随机搜 AV，下一秒遇见女神",
      description:
        "从番号、演员到剧情口味，输入任何灵感；左侧关键词大词典随时点燃新的搜索思路。",
      emphasis: "搜得不满意？连续点按搜索键，多刷新几次直到撞见最想要的女神。",
      features: [
        {
          title: "随机匹配，灵感不停",
          description: "任意组合关键词，一键抽选 AV 作品。",
        },
        {
          title: "关键词词典助攻",
          description: "搜索框左侧收录热门到冷门标签，点一点拓展灵感池。",
        },
        {
          title: "沉浸式欣赏",
          description: "封面、剧照、样片同时呈现，还能随手留下评论。",
        },
        {
          title: "轻松点赞收藏",
          description: "快速注册即可点赞，心仪作品一键收入私人收藏册。",
        },
        {
          title: "无限刷新体验",
          description: "不满意当前结果？继续搜索立刻换一批，全程无等待。",
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
    signInEmail: {
      subject: "歡迎登入 Lucky JAV",
      previewText: "透過這封信完成 Lucky JAV 的安全登入。",
      greeting: "您好，",
      intro:
        "您剛剛在 Lucky JAV 發起了電子郵件登入請求。請點擊下方按鈕完成身分驗證：",
      button: "立即登入 Lucky JAV",
      fallbackIntro: "若按鈕無法開啟，請將下列連結複製到瀏覽器：",
      expiry:
        "為了守護您的帳號安全，此連結將在 15 分鐘後失效，僅適用於本次請求。",
      ignore: "若這不是您本人操作，請忽略此郵件，我們不會採取任何動作。",
      closing: "祝您使用愉快，感謝您信任 Lucky JAV！",
      signature: "Lucky JAV 團隊 敬上",
      footer: "此信件由系統自動寄出，請勿直接回覆。",
    },
    myPage: {
      backToHome: "返回首頁",
      posterLabel: "收藏海報",
      loginRequiredTitle: "需要登入才可查看私人收藏",
      loginRequiredCta: "前往登入",
      emptyTitle: "尚未收藏",
      emptyDescription: "按個讚，海報就會自動收藏到這裡。",
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
      badge: "好運AV",
      heading1: "輸入任意關鍵字隨機搜 AV，下一秒邂逅女神",
      description:
        "從番號、演員到情境口味，輸入任何靈感；左側關鍵字大詞典讓靈感源源不絕。",
      emphasis: "結果不對味？連續點擊搜尋鍵再抽幾次，直到抽中最想看的女神。",
      features: [
        {
          title: "隨機匹配，靈感不斷",
          description: "自由組合關鍵字，一鍵抽選全站 AV 作品。",
        },
        {
          title: "關鍵字詞典助攻",
          description: "搜尋框左側收錄熱門到冷門標籤，點一下拓展靈感池。",
        },
        {
          title: "沉浸式欣賞",
          description: "封面、劇照、樣片同時呈現，還能即時留言互動。",
        },
        {
          title: "輕鬆按讚收藏",
          description: "快速註冊立即按讚，心頭好作品一鍵加入私人收藏冊。",
        },
        {
          title: "無限刷新體驗",
          description: "不喜歡目前結果？再搜尋立刻換一批，完全不用等待。",
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
    signInEmail: {
      subject: "Lucky JAVへログイン",
      previewText:
        "このメールから Lucky JAV への安全なサインインを完了してください。",
      greeting: "こんにちは。",
      intro:
        "Lucky JAV でメールリンクによるサインインをリクエストされました。下のボタンを押して認証を完了してください。",
      button: "Lucky JAV に今すぐサインインする",
      fallbackIntro:
        "ボタンを開けない場合は、次のリンクをブラウザにコピーしてください。",
      expiry:
        "セキュリティ保護のため、このリンクは 15 分後に失効し、今回のリクエストのみに有効です。",
      ignore:
        "お心当たりがない場合は、このメールを破棄してください。これ以上の処理は行われません。",
      closing: "ご利用ありがとうございます。Lucky JAV をお楽しみください。",
      signature: "Lucky JAV チーム",
      footer: "このメールは自動送信です。返信には対応できません。",
    },
    myPage: {
      backToHome: "トップに戻る",
      posterLabel: "コレクション",
      loginRequiredTitle: "ログインするとコレクションを閲覧できます",
      loginRequiredCta: "ログインへ",
      emptyTitle: "まだお気に入りがありません",
      emptyDescription: "いいねを押すと、ここに自動でコレクションされます。",
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
      badge: "ラッキーAV",
      heading1:
        "好きなキーワードで AV をランダム探索、次の瞬間に出会う決めの一本",
      description:
        "品番、女優、シチュエーションまで、ひらめいた言葉を入力。左側のキーワード大辞典で新しい切り口もすぐ見つかります。",
      emphasis:
        "結果がしっくり来なければ検索ボタンを連打、納得いくまで何度でもリロード。",
      features: [
        {
          title: "ランダムマッチで新発見",
          description: "自由なキーワードの組み合わせで全作品をシャッフル抽出。",
        },
        {
          title: "キーワード大辞典",
          description:
            "検索ボックス左の辞典から人気タグもレアタグもワンタップで追加。",
        },
        {
          title: "没入型プレビュー",
          description:
            "ジャケット・スチル・サンプル映像を同時に楽しみ、コメントも投稿可能。",
        },
        {
          title: "ワンクリックでお気に入り",
          description:
            "スピード登録ですぐにいいね、そしてマイコレクションへ保存。",
        },
        {
          title: "納得するまで再検索",
          description:
            "気に入るまで何度でも再抽選、待ち時間ゼロでラインナップを更新。",
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
    signInEmail: {
      subject: "Welcome back to Lucky JAV",
      previewText:
        "Use this message to complete your secure Lucky JAV sign-in.",
      greeting: "Hello,",
      intro:
        "You just asked to sign in to Lucky JAV with this email address. Click the button below to confirm it's you:",
      button: "Sign in to Lucky JAV",
      fallbackIntro:
        "If the button doesn’t work, copy the full link below into your browser:",
      expiry:
        "For security, this link expires in 15 minutes and only works for this request.",
      ignore:
        "If you didn’t try to sign in, simply ignore this email and no action will be taken.",
      closing: "Thanks for being with Lucky JAV—enjoy your time!",
      signature: "Lucky JAV Team",
      footer:
        "This is an automated message. Replies to this inbox aren’t monitored.",
    },
    myPage: {
      backToHome: "Back to home",
      posterLabel: "Posters",
      loginRequiredTitle: "Sign in to view your collection",
      loginRequiredCta: "Go to login",
      emptyTitle: "No favorites yet",
      emptyDescription: "Like a cover to see it here.",
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
      badge: "Lucky AV",
      heading1:
        "Search any keyword and let a surprise AV pick find you in seconds",
      description:
        "Type whatever sparks your curiosity: IDs, performers, studios, kinks; the discovery engine spins up a tailored lineup. The keyword dictionary on the left keeps fresh ideas flowing.",
      emphasis:
        "Not feeling the match? Hit search again and remix your results as many times as you like.",
      features: [
        {
          title: "Randomized finds on demand",
          description:
            "Mash up any keywords to shuffle intelligent AV recommendations instantly.",
        },
        {
          title: "Keyword dictionary at hand",
          description:
            "Browse the left-side atlas for trending and niche terms to ignite new searches.",
        },
        {
          title: "Immersive viewing suite",
          description:
            "Covers, stills, and trailers load together, and comments keep the conversation going.",
        },
        {
          title: "Quick like & collect",
          description:
            "Register in moments to drop likes and file favorites into your private collection.",
        },
        {
          title: "Endless re-rolls",
          description:
            "Swap the lineup with another search the second you want something different.",
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
