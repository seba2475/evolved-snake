# Evolved Snake

## Vercel Link
貼上你的 Vercel 連結

## Design Concept
我的進化版 Snake 名稱是 Memory Fog Snake。這個版本改變了原版貪食蛇「玩家可以看見整張地圖」的玩法，加入迷霧視野限制。玩家只能看見蛇頭附近的一小塊範圍，距離太遠的食物、蛇身和牆壁都會被迷霧遮住。因此玩家不只要控制方向，還需要記住剛剛看過的位置，判斷下一步是否安全。

我希望這個版本讓 Snake 從單純的反應遊戲，變成需要短期記憶、方向感和風險判斷的遊戲。玩家在吃食物時，不能只看眼前的路，還要思考自己剛才走過哪裡，避免撞到看不見的蛇身。另外，遊戲中加入短暫清除迷霧的藍色道具，讓玩家在危險時獲得視野，但也需要判斷什麼時候吃最有利。

我希望同學玩完後會覺得，這不是普通換皮的 Snake，而是一個更緊張、更需要思考路線的版本。

## How My Version Is Different
我的版本和原版 Snake 最大的差異是加入了「迷霧視野限制」。普通 Snake 可以看到整張地圖，但 Memory Fog Snake 只能看到蛇頭附近的範圍。玩家必須記住蛇身、食物和牆壁的位置，並根據記憶做出移動判斷。

## How To Play
使用方向鍵或 WASD 控制蛇的移動方向。蛇會自動前進，吃到紅色食物可以增加分數並讓蛇變長。如果撞到牆壁或自己的身體，遊戲就會結束。畫面中大部分區域會被迷霧遮住，玩家只能看到蛇頭附近的範圍。若吃到藍色道具，可以短暫看清整張地圖，幫助玩家重新判斷路線。

## Three-Step Development
1. Static Screen：先完成標題、分數、棋盤、蛇、食物與操作說明。
2. One Interaction：讓玩家可以用方向鍵或 WASD 控制蛇移動。
3. Complete Rules：加入自動前進、吃食物、加分、變長、死亡判定、迷霧與藍色視野道具。

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy to Vercel
1. 把專案上傳到 GitHub。
2. 到 Vercel 選擇 New Project。
3. 匯入這個 GitHub repository。
4. Framework 選 Vite，Build Command 使用 `npm run build`，Output Directory 使用 `dist`。
5. 部署完成後，把網址貼到上方 Vercel Link。
