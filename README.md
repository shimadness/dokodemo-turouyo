# 🎣 どこでも釣ろうよ

カメラを構えて、どこにでも竿を投げられるAR釣りゲーム。
本物の水辺では本物の魚が、道端の水たまりや自販機の下では**この世に存在しない生き物**が釣れる。

- **遊ぶ**: [fishing.html](https://shimadness.github.io/dokodemo-turouyo/fishing.html)
- **今週の図鑑（開発ギャラリー）**: [index.html](https://shimadness.github.io/dokodemo-turouyo/)

## しくみ

- 生き物はパーツSVG合成（spec JSON 約300バイト/体）。画像生成なし
- 週替わりで「今週のテイスト」に沿った20体が生成される（現在: 2026-w29「深海ネオン」）
- 場所（水たまり/街なか/ありえない場所）で抽選テーブルが変わる
- 図鑑は端末内(localStorage)に保存。未発見はシルエット表示

## 開発

```sh
python3 devserver.py 8642   # ESモジュールのキャッシュ対策込みの開発サーバー
```
