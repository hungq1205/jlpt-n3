export interface FormulaBlock {
  labels: string[];
  stack: string[];
  operator?: string;
  fixed: string[];
  note?: string;
}

export interface GrammarExample {
  jp: string;
  ruby: string;
  highlight: string;
  vi: string;
}

export interface GrammarItem {
  id: number;
  pattern: string;
  meaning: string;
  formulas: FormulaBlock[];
  examples: GrammarExample[];
}

export interface GrammarQuizQuestion {
  id: string;
  grammarId: number;
  grammarPattern: string;
  direction: 'jp-to-vi' | 'vi-to-jp';
  question: string;
  questionRuby?: string;
  options: string[];
  optionsRuby?: string[];
  correctIndex: number;
  explanation: string;
  audioText: string;
}

export interface LessonGrammar {
  lessonId: string;
  chapterTitle: string;
  lessonTitle: string;
  subtitle: string;
  items: GrammarItem[];
  quiz: GrammarQuizQuestion[];
}

export const LESSON_1_GRAMMAR: LessonGrammar = {
  lessonId: "lesson-1",
  chapterTitle: "CHƯƠNG 1",
  lessonTitle: "BÀI 1",
  subtitle: "Ngữ Pháp Tiếng Nhật",
  items: [
    {
      id: 1,
      pattern: "～ば～ほど",
      meaning: "Càng... càng...",
      formulas: [
        {
          labels: [
            "Càng làm V thì càng...",
            "Càng (tính từ i) thì càng...",
            "Càng (tính từ na/danh từ) thì càng..."
          ],
          stack: [
            "V ば",
            "A いければ",
            "Aな / N なら"
          ],
          operator: "+",
          fixed: [
            "V る ほど",
            "A い ほど",
            "Aな / N な ほど"
          ]
        }
      ],
      examples: [
        {
          jp: "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
          ruby: "日本語[にほんご]が上手[じょうず]であればあるほど、日本[にほん]の会社[かいしゃ]で働[はたら]きやすくなる。",
          highlight: "上手であればあるほど",
          vi: "Tiếng Nhật càng giỏi thì càng dễ làm việc ở công ty Nhật."
        }
      ]
    },
    {
      id: 2,
      pattern: "～ようなら",
      meaning: "Nếu như... (giả sử xảy ra)",
      formulas: [
        {
          labels: [
            "Nếu như (hành động/trạng thái)...",
            "Nếu như là (tính từ na/danh từ)..."
          ],
          stack: [
            "Vる / Vない / Aい",
            "Aな / N"
          ],
          operator: "+",
          fixed: [
            "よう + なら",
            "よう + なら / であれば"
          ]
        }
      ],
      examples: [
        {
          jp: "この問題が解けないようなら、大学に行くのは無理だよ。",
          ruby: "この問題[もんだい]が解[と]けないようなら、大学[だいがく]に行[い]くのは無理[むり]だよ。",
          highlight: "解けないようなら",
          vi: "Nếu như không giải được bài này thì đại học là vô vọng đấy."
        }
      ]
    },
    {
      id: 3,
      pattern: "～ように",
      meaning: "Để V / Để không V",
      formulas: [
        {
          labels: [
            "Để làm V",
            "Để không làm V"
          ],
          stack: [
            "Vる",
            "Vない"
          ],
          operator: "+",
          fixed: [
            "ように",
            "ように"
          ]
        }
      ],
      examples: [
        {
          jp: "子供がゲームをやりすぎないように、2時間を超えて続けていたら...",
          ruby: "子供[こども]がゲームをやりすぎないように、2時間[じかん]を超[こ]えて続[つづ]けていたら...",
          highlight: "やりすぎないように",
          vi: "Để bọn trẻ không chơi game quá nhiều, nếu chơi quá 2 tiếng thì..."
        }
      ]
    },
    {
      id: 4,
      pattern: "～ようにする",
      meaning: "(Sẽ) Cố gắng V / Không V",
      formulas: [
        {
          labels: [
            "Sẽ cố gắng làm V",
            "Sẽ cố gắng không làm V"
          ],
          stack: [
            "Vる",
            "Vない"
          ],
          operator: "+",
          fixed: [
            "ようにする",
            "ようにする"
          ]
        }
      ],
      examples: [
        {
          jp: "目に悪いから、寝る前にスマホを使わないようにしましょう。",
          ruby: "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]わないようにしましょう。",
          highlight: "使わないようにしましょう",
          vi: "Vì hại mắt nên hãy cố gắng không dùng điện thoại trước khi ngủ."
        }
      ]
    },
    {
      id: 5,
      pattern: "～ようにしている",
      meaning: "Cố gắng duy trì thói quen",
      formulas: [
        {
          labels: [
            "Duy trì thói quen làm V",
            "Duy trì thói quen không làm V"
          ],
          stack: [
            "Vる",
            "Vない"
          ],
          operator: "+",
          fixed: [
            "ようにしている",
            "ようにしている"
          ]
        }
      ],
      examples: [
        {
          jp: "健康のために、毎日野菜を食べるようにしています。",
          ruby: "健康[けんこう]のために、毎日[まいにち]野菜[やさい]を食[た]べるようにしています。",
          highlight: "食べるようにしています",
          vi: "Vì sức khỏe, tôi cố gắng duy trì thói quen ăn rau mỗi ngày."
        }
      ]
    },
    {
      id: 6,
      pattern: "～ところだ",
      meaning: "Sắp / Đang / Vừa mới",
      formulas: [
        {
          labels: [
            "Sắp sửa / Chuẩn bị làm V",
            "Đúng vào lúc đang làm V",
            "Vừa mới làm V xong"
          ],
          stack: [
            "Vる",
            "Vている",
            "Vた"
          ],
          operator: "+",
          fixed: [
            "ところだ",
            "ところだ",
            "ところだ"
          ]
        }
      ],
      examples: [
        {
          jp: "これから取り替えるところ。",
          ruby: "これから取[と]り替[か]えるところ。",
          highlight: "取り替えるところ",
          vi: "Tôi chuẩn bị thay đây. (Sắp sửa)"
        },
        {
          jp: "ちょっとゴミを回収しているところでした。",
          ruby: "ちょっとゴミを回収[かいしゅう]しているところでした。",
          highlight: "ゴミを回収しているところ",
          vi: "Đúng lúc tôi đang thu gom rác."
        },
        {
          jp: "ちょうど今、受け取ったところです。",
          ruby: "ちょうど今[いま]、受[う]け取[と]ったところです。",
          highlight: "受け取ったところ",
          vi: "Đúng lúc tôi vừa mới nhận được."
        }
      ]
    },
    {
      id: 7,
      pattern: "～たばかり",
      meaning: "Vừa mới V",
      formulas: [
        {
          labels: [
            "Vừa mới làm V (cảm giác thời gian rất ngắn)"
          ],
          stack: [
            "Vた"
          ],
          operator: "+",
          fixed: [
            "ばかり"
          ]
        }
      ],
      examples: [
        {
          jp: "さっき帰ってきたばかりなので、まだメールをチェックしていないんです。",
          ruby: "さっき帰[かえ]ってきたばかりなので、まだメールをチェックしていないんです。",
          highlight: "帰ってきたばかり",
          vi: "Vì tôi vừa mới về lúc nãy nên vẫn chưa kiểm tra email."
        }
      ]
    }
  ],
  quiz: [
    {
      id: "q1",
      grammarId: 1,
      grammarPattern: "～ば～ほど",
      direction: "jp-to-vi",
      question: "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
      questionRuby: "日本語[にほんご]が上手[じょうず]であればあるほど、日本[にほん]の会社[かいしゃ]で働[はたら]きやすくなる。",
      audioText: "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
      options: [
        "Tiếng Nhật càng giỏi thì càng dễ làm việc ở công ty Nhật.",
        "Nếu tiếng Nhật không giỏi thì không thể làm việc ở công ty Nhật.",
        "Tôi đang cố gắng học giỏi tiếng Nhật để làm ở công ty Nhật.",
        "Vì vừa mới giỏi tiếng Nhật nên tôi đã xin được vào công ty Nhật."
      ],
      correctIndex: 0,
      explanation: "「Aであればあるほど」: Càng (A) thì càng... Tiếng Nhật càng giỏi thì càng dễ làm việc."
    },
    {
      id: "q2",
      grammarId: 2,
      grammarPattern: "～ようなら",
      direction: "jp-to-vi",
      question: "この問題が解けないようなら、大学に行くのは無理だよ。",
      questionRuby: "この問題[もんだい]が解[と]けないようなら、大学[だいがく]に行[い]くのは無理[むり]だよ。",
      audioText: "この問題が解けないようなら、大学に行くのは無理だよ。",
      options: [
        "Vì không giải được câu này nên tôi không muốn vào đại học.",
        "Nếu như không giải được bài này thì đại học là vô vọng đấy.",
        "Để giải được bài này, tôi phải cố gắng vào đại học.",
        "Tôi vừa mới giải xong bài này trước khi đi học đại học."
      ],
      correctIndex: 1,
      explanation: "「Vないようなら」: Nếu như (không giải được) thì..."
    },
    {
      id: "q3",
      grammarId: 3,
      grammarPattern: "～ように",
      direction: "jp-to-vi",
      question: "子供がゲームをやりすぎないように、2時間を超えて続けていたら注意する。",
      questionRuby: "子供[こども]がゲームをやりすぎないように、2時間[じかん]を超[こ]えて続[つづ]けていたら注意[ちゅうい]する。",
      audioText: "子供がゲームをやりすぎないように、2時間を超えて続けていたら注意する。",
      options: [
        "Bọn trẻ vừa mới chơi game xong sau hơn 2 tiếng đồng hồ.",
        "Nếu bọn trẻ không thích chơi game thì sẽ không chơi quá 2 tiếng.",
        "Để bọn trẻ không chơi game quá nhiều, nếu quá 2 tiếng sẽ nhắc nhở.",
        "Bọn trẻ càng chơi game nhiều thì càng khó dừng lại."
      ],
      correctIndex: 2,
      explanation: "「Vないように」: Để không làm V (chỉ mục đích)."
    },
    {
      id: "q4",
      grammarId: 4,
      grammarPattern: "～ようにする",
      direction: "jp-to-vi",
      question: "目に悪いから、寝る前にスマホを使わないようにしましょう。",
      questionRuby: "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]わないようにしましょう。",
      audioText: "目に悪いから、寝る前にスマホを使わないようにしましょう。",
      options: [
        "Vì hại mắt nên tôi vừa mới ngưng dùng điện thoại trước khi đi ngủ.",
        "Dùng điện thoại trước khi ngủ càng nhiều thì mắt càng yếu đi.",
        "Nếu dùng điện thoại trước khi ngủ thì mắt sẽ bị hỏng.",
        "Vì hại mắt nên hãy cố gắng không dùng điện thoại trước khi ngủ."
      ],
      correctIndex: 3,
      explanation: "「Vないようにする」: Cố gắng / sẽ cố gắng không làm V."
    },
    {
      id: "q5",
      grammarId: 5,
      grammarPattern: "～ようにしている",
      direction: "jp-to-vi",
      question: "健康のために、毎日野菜を食べるようにしています。",
      questionRuby: "健康[けんこう]のために、毎日[まいにち]野菜[やさい]を食[た]べるようにしています。",
      audioText: "健康のために、毎日野菜を食べるようにしています。",
      options: [
        "Vì sức khỏe, tôi cố gắng duy trì thói quen ăn rau mỗi ngày.",
        "Để có sức khỏe tốt, tôi chuẩn bị đi mua rau ăn.",
        "Rau càng tươi ngon thì càng tốt cho sức khỏe của tôi.",
        "Tôi vừa mới ăn xong một đĩa rau vì sức khỏe."
      ],
      correctIndex: 0,
      explanation: "「Vるようにしている」: Thói quen luôn cố gắng duy trì đều đặn."
    },
    {
      id: "q6",
      grammarId: 6,
      grammarPattern: "～ところだ",
      direction: "jp-to-vi",
      question: "これから取り替えるところ。",
      questionRuby: "これから取[と]り替[か]えるところ。",
      audioText: "これから取り替えるところ。",
      options: [
        "Tôi vừa mới thay thế xong tức thì.",
        "Tôi chuẩn bị thay đây. (Sắp sửa làm)",
        "Tôi đang trong quá trình thay thế phụ tùng.",
        "Càng thay thế nhiều thì càng tốn kém."
      ],
      correctIndex: 1,
      explanation: "「Vる + ところだ」: Sắp sửa / chuẩn bị làm V."
    },
    {
      id: "q7",
      grammarId: 6,
      grammarPattern: "～ところだ",
      direction: "jp-to-vi",
      question: "ちょっとゴミを回収しているところでした。",
      questionRuby: "ちょっとゴミを回収[かいしゅう]しているところでした。",
      audioText: "ちょっとゴミを回収しているところでした。",
      options: [
        "Tôi vừa mới thu gom rác xong lúc nãy.",
        "Tôi sắp sửa đi gom rác đây.",
        "Đúng lúc tôi đang thu gom rác.",
        "Tôi cố gắng gom rác mỗi ngày như một thói quen."
      ],
      correctIndex: 2,
      explanation: "「Vている + ところだ」: Đúng vào lúc đang diễn ra hành động."
    },
    {
      id: "q8",
      grammarId: 7,
      grammarPattern: "～たばかり",
      direction: "jp-to-vi",
      question: "さっき帰ってきたばかりなので、まだメールをチェックしていないんです。",
      questionRuby: "さっき帰[かえ]ってきたばかりなので、まだメールをチェックしていないんです。",
      audioText: "さっき帰ってきたばかりなので、まだメールをチェックしていないんです。",
      options: [
        "Vì tôi đang chuẩn bị về nhà nên chưa kịp kiểm tra email.",
        "Để về nhà sớm, tôi đã không kiểm tra email nữa.",
        "Nếu về đến nhà mà chưa thấy email thì tôi sẽ kiểm tra sau.",
        "Vì tôi vừa mới về lúc nãy nên vẫn chưa kiểm tra email."
      ],
      correctIndex: 3,
      explanation: "「Vたばかり」: Vừa mới làm V trong cảm nhận người nói."
    },
    {
      id: "q9",
      grammarId: 1,
      grammarPattern: "～ば～ほど",
      direction: "vi-to-jp",
      question: "Tiếng Nhật càng giỏi thì càng dễ làm việc ở công ty Nhật.",
      audioText: "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
      options: [
        "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
        "日本語が上手なようなら、日本の会社で働くようにする。",
        "日本語が上手になるように、日本の会社で働いているところだ。",
        "日本語が上手になったばかりなので、日本の会社で働けない。"
      ],
      optionsRuby: [
        "日本語[にほんご]が上手[じょうず]であればあるほど、日本[にほん]の会社[かいしゃ]で働[はたら]きやすくなる。",
        "日本語[にほんご]が上手[じょうず]なようなら、日本[にほん]の会社[かいしゃ]で働[はたら]くようにする。",
        "日本語[にほんご]が上手[じょうず]になるように、日本[にほん]の会社[かいしゃ]で働[はたら]いているところだ。",
        "日本語[にほんご]が上手[じょうず]になったばかりなので、日本[にほん]の会社[かいしゃ]で働[はたら]けない。"
      ],
      correctIndex: 0,
      explanation: "Càng... càng... sử dụng「～ば～ほど」(Aななら / であれば + Aななほど)."
    },
    {
      id: "q10",
      grammarId: 2,
      grammarPattern: "～ようなら",
      direction: "vi-to-jp",
      question: "Nếu như không giải được bài này thì đại học là vô vọng đấy.",
      audioText: "この問題が解けないようなら、大学に行くのは無理だよ。",
      options: [
        "この問題が解けるように、大学に行くようにしている。",
        "この問題が解けないようなら、大学に行くのは無理だよ。",
        "この問題を解いたばかりだから、大学に行けるはずだ。",
        "この問題が解ければ解けるほど、大学に行くのが無理になる。"
      ],
      optionsRuby: [
        "この問題[もんだい]が解[と]けるように、大学[だいがく]に行[い]くようにしている。",
        "この問題[もんだい]が解[と]けないようなら、大学[だいがく]に行[い]くのは無理[むり]だよ。",
        "この問題[もんだい]を解[と]いたばかりだから、大学[だいがく]に行[い]けるはずだ。",
        "この問題[もんだい]が解[と]ければ解[と]けるほど、大学[だいがく]に行[い]くのが無理[むり]になる。"
      ],
      correctIndex: 1,
      explanation: "Nếu như... (giả sử xảy ra trường hợp đó) ->「～ようなら」."
    },
    {
      id: "q11",
      grammarId: 4,
      grammarPattern: "～ようにする",
      direction: "vi-to-jp",
      question: "Vì hại mắt nên hãy cố gắng không dùng điện thoại trước khi ngủ.",
      audioText: "目に悪いから、寝る前にスマホを使わないようにしましょう。",
      options: [
        "目に悪いから、寝る前にスマホを使うところです。",
        "目に悪いから、寝る前にスマホを使えば使うほど眠れなくなる。",
        "目に悪いから、寝る前にスマホを使わないようにしましょう。",
        "目に悪いから、寝る前にスマホを使ったばかりです。"
      ],
      optionsRuby: [
        "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]うところです。",
        "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]えば使[つか]うほど眠[ねむ]れなくなる。",
        "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]わないようにしましょう。",
        "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]ったばかりです。"
      ],
      correctIndex: 2,
      explanation: "Lời khuyên cố gắng không làm V ->「～ないようにする (ましょう)」."
    },
    {
      id: "q12",
      grammarId: 6,
      grammarPattern: "～ところだ",
      direction: "vi-to-jp",
      question: "Đúng lúc tôi vừa mới nhận được (hàng/thư).",
      audioText: "ちょうど今、受け取ったところです。",
      options: [
        "ちょうど今、受け取るようにしています。",
        "ちょうど今、受け取れば受け取るほど嬉しいです。",
        "ちょうど今、受け取らないようなら連絡します。",
        "ちょうど今、受け取ったところです。"
      ],
      optionsRuby: [
        "ちょうど今[いま]、受[う]け取[と]るようにしています。",
        "ちょうど今[いま]、受[う]け取[と]れば受[う]け取[と]るほど嬉[うれ]しいです。",
        "ちょうど今[いま]、受[う]け取[と]らないようなら連絡[れんらく]します。",
        "ちょうど今[いま]、受[う]け取[と]ったところです。"
      ],
      correctIndex: 3,
      explanation: "Vừa mới làm V xong tại đúng thời điểm hiện tại:「Vた + ところです」."
    }
  ]
};

export const LESSON_2_GRAMMAR: LessonGrammar = {
  lessonId: "lesson-2",
  chapterTitle: "CHƯƠNG 1",
  lessonTitle: "BÀI 2",
  subtitle: "Ngữ Pháp Tiếng Nhật",
  items: [
    {
      id: 1,
      pattern: "～うちに",
      meaning: "Trong lúc... (trước khi trạng thái thay đổi)",
      formulas: [
        {
          labels: [
            "Trong lúc làm V",
            "Trong lúc tính từ i",
            "Trong lúc tính từ na / danh từ"
          ],
          stack: [
            "Vる / Vている / Vない",
            "Aい",
            "Aな / Nの"
          ],
          operator: "+",
          fixed: [
            "うちに",
            "うちに",
            "うちに"
          ]
        }
      ],
      examples: [
        {
          jp: "温かいうちに、早く食べてください。",
          ruby: "温[あたた]かいうちに、早[はや]く食[た]べてください。",
          highlight: "温かいうちに",
          vi: "Trong lúc đồ ăn còn nóng, hãy ăn nhanh lên nhé."
        }
      ]
    },
    {
      id: 2,
      pattern: "～あいだに",
      meaning: "Trong khoảng thời gian... (hành động ngắn diễn ra)",
      formulas: [
        {
          labels: [
            "Trong lúc hành động kéo dài",
            "Trong lúc danh từ chỉ thời gian"
          ],
          stack: [
            "Vている",
            "Nの"
          ],
          operator: "+",
          fixed: [
            "あいだに",
            "あいだに"
          ]
        }
      ],
      examples: [
        {
          jp: "留守のあいだに、泥棒が入った。",
          ruby: "留守[るす]のあいだに、泥棒[どろぼう]が入[はい]った。",
          highlight: "留守のあいだに",
          vi: "Trong lúc vắng nhà, trộm đã đột nhập vào."
        }
      ]
    }
  ],
  quiz: [
    {
      id: "l2-q1",
      grammarId: 1,
      grammarPattern: "～うちに",
      direction: "jp-to-vi",
      question: "温かいうちに、早く食べてください。",
      questionRuby: "温[あたた]かいうちに、早[はや]く食[た]べてください。",
      audioText: "温かいうちに、早く食べてください。",
      options: [
        "Trong lúc đồ ăn còn nóng, hãy ăn nhanh lên nhé.",
        "Vì vừa mới nấu xong nên hãy ăn nhanh lên nhé.",
        "Càng nóng thì ăn càng thấy ngon hơn.",
        "Nếu đồ ăn không nóng thì đừng ăn nhé."
      ],
      correctIndex: 0,
      explanation: "「～うちに」: Làm điều gì đó trong khi trạng thái hiện tại còn tiếp diễn."
    },
    {
      id: "l2-q2",
      grammarId: 2,
      grammarPattern: "～あいだに",
      direction: "vi-to-jp",
      question: "Trong lúc vắng nhà, trộm đã đột nhập vào.",
      audioText: "留守のあいだに、泥棒が入った。",
      options: [
        "留守のうちに、泥棒が入った。",
        "留守のあいだに、泥棒が入った。",
        "留守にしたばかりで、泥棒が入った。",
        "留守であればあるほど、泥棒が入った。"
      ],
      optionsRuby: [
        "留守[るす]のうちに、泥棒[どろぼう]が入[はい]った。",
        "留守[るす]のあいだに、泥棒[どろぼう]が入[はい]った。",
        "留守[るす]にしたばかりで、泥棒[どろぼう]が入[はい]った。",
        "留守[るす]であればあるほど、泥棒[どろぼう]が入[はい]った。"
      ],
      correctIndex: 1,
      explanation: "Trong khoảng thời gian vắng nhà có hành động trộm xen vào ->「Nのあいだに」."
    }
  ]
};

export const ALL_LESSON_GRAMMAR: Record<string, LessonGrammar> = {
  "lesson-1": LESSON_1_GRAMMAR,
  "lesson-2": LESSON_2_GRAMMAR,
};
