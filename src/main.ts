import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject";

declare const window: RPGAtsumaruWindow;

export function main(param: GameMainParameterObject): void {

	const blockList: g.FilledRect[] = [];

	let timeLimit = 60;

	const titleScene = createTitleScene();
	titleScene.loaded.add(() => {

		setTimeout(() => {
			const scene = new g.Scene({
				game: g.game,
				// このシーンで利用するアセットのIDを列挙し、シーンに通知します
				assetIds: ["player", "shot", "se"]
			});
			scene.loaded.add(() => {
				// ここからゲーム内容を記述します

				// スコア
				g.game.vars.gameState = {
					score: 0,
					playThreshold: 0
				};
				g.game.vars.gameState.score = 0;

				// テキスト表示
				const font = new g.DynamicFont({
					game: g.game,
					fontFamily: g.FontFamily.SansSerif,
					size: 20
				});
				const label = new g.Label({
					scene: scene,
					font: font,
					text: `得点 ${g.game.vars.gameState.score}`,
					textColor: "black",
					fontSize: 20,
					x: 10,
					y: 10
				});
				scene.append(label);

				// 残り時間
				const sessionParameter = param.sessionParameter;
				if (sessionParameter && sessionParameter.totalTimeLimit) {
					timeLimit = sessionParameter.totalTimeLimit;
				}
				// テキスト表示
				const timeLimitFont = new g.DynamicFont({
					game: g.game,
					fontFamily: g.FontFamily.SansSerif,
					size: 20
				});
				const timeLimitLabel = new g.Label({
					scene: scene,
					font: timeLimitFont,
					text: `残り時間 ${timeLimit}`,
					textColor: "black",
					fontSize: 20,
					x: g.game.width - 200,
					y: 10
				});
				scene.append(timeLimitLabel);

				setInterval(() => {
					timeLimit--;
					timeLimitLabel.text = `残り時間 ${timeLimit}`;
					timeLimitLabel.invalidate();
				}, 1000);

				// プレイヤーを生成します
				const player = new g.Sprite({
					scene: scene,
					src: scene.assets["player"],
					width: (scene.assets["player"] as g.ImageAsset).width,
					height: (scene.assets["player"] as g.ImageAsset).height
				});

				// プレイヤーの初期座標を、画面の中心に設定します
				player.x = 100;
				player.y = (g.game.height - player.height) / 2;

				// player.update.add(() => {
				// 	// 毎フレームでY座標を再計算し、プレイヤーの飛んでいる動きを表現します
				// 	// ここではMath.sinを利用して、時間経過によって増加するg.game.ageと組み合わせて
				// 	player.y = (g.game.height - player.height) / 2 + Math.sin(g.game.age % (g.game.fps * 10) / 4) * 10;

				// 	// プレイヤーの座標に変更があった場合、 modified() を実行して変更をゲームに通知します
				// 	player.modified();
				// });

				scene.pointMoveCapture.add((event) => {
					const oldPos = player.y;
					player.y += event.prevDelta.y;
					if (player.y >= g.game.height || player.y <= 0) {
						player.y = oldPos;
					}
					player.modified();
				});

				setInterval(() => {
					const block = new g.FilledRect({
						scene: scene,
						width: 50,
						height: 50,
						cssColor: "black",
						x: g.game.width,
						y: g.game.random.get(1, g.game.height)
					});
					blockList.push(block);
					block.update.add(() => {
						block.x -= 10;
						if (block.x < 0) {
							block.destroy();
						}
						if (g.Collision.intersectAreas(block, player)) {
							// 消す
							block.destroy();
							// 減点
							if (g.game.vars.gameState.score - 5 >= 0) {
								g.game.vars.gameState.score -= 5;
								label.text = `得点 ${g.game.vars.gameState.score}`;
								// 再描画
								label.invalidate();
							}
							// 配列からも消す
							const index = blockList.indexOf(block);
							blockList.splice(index, 1);
						}
						block.modified();
					});
					scene.append(block);
				}, 1000 / 2);

				setInterval(() => {
					const block = new g.FilledRect({
						scene: scene,
						width: 20,
						height: 20,
						cssColor: "red",
						x: g.game.width,
						y: g.game.random.get(1, g.game.height)
					});
					block.update.add(() => {
						block.x -= 10;
						if (block.x < 0) {
							block.destroy();
						}
						if (g.Collision.intersectAreas(block, player)) {
							// 消す
							block.destroy();
							// 加点
							g.game.vars.gameState.score += 10;
							label.text = `得点 ${g.game.vars.gameState.score}`;
							// 再描画
							label.invalidate();
						}
						block.modified();
					});
					scene.append(block);
				}, 1000 * 2);

				setInterval(() => {
					const block = new g.FilledRect({
						scene: scene,
						width: 10,
						height: 10,
						cssColor: "green",
						x: g.game.width,
						y: g.game.random.get(1, g.game.height)
					});
					block.update.add(() => {
						block.x -= 20;
						if (block.x < 0) {
							block.destroy();
						}
						if (g.Collision.intersectAreas(block, player)) {
							// 消す
							block.destroy();
							// 加点
							g.game.vars.gameState.score += 20;
							label.text = `得点 ${g.game.vars.gameState.score}`;
							// 再描画
							label.invalidate();
						}
						block.modified();
					});
					scene.append(block);
				}, 1000 * 4);

				// // 画面をタッチしたとき、SEを鳴らします
				// scene.pointDownCapture.add(() => {
				// 	// (scene.assets["se"] as g.AudioAsset).play();

				// 	if (g.game.vars.gameState.score >= 100) {
				// 		// プレイヤーが発射する弾を生成します
				// 		const shot = new g.Sprite({
				// 			scene: scene,
				// 			src: scene.assets["shot"],
				// 			width: (scene.assets["shot"] as g.ImageAsset).width,
				// 			height: (scene.assets["shot"] as g.ImageAsset).height
				// 		});

				// 		// 弾の初期座標を、プレイヤーの少し右に設定します
				// 		shot.x = player.x + player.width;
				// 		shot.y = player.y;
				// 		shot.update.add(() => {
				// 			// 毎フレームで座標を確認し、画面外に出ていたら弾をシーンから取り除きます
				// 			if (shot.x > g.game.width) shot.destroy();

				// 			// 弾を右に動かし、弾の動きを表現します
				// 			shot.x += 20;

				// 			//当たったら破壊
				// 			blockList.forEach(element => {
				// 				if (g.Collision.intersectAreas(element, shot)) {
				// 					element.destroy()
				// 					shot.destroy()
				// 					const index = blockList.indexOf(element)
				// 					blockList.splice(index, 1)
				// 				}
				// 			});

				// 			// 変更をゲームに通知します
				// 			shot.modified();
				// 		});
				// 		scene.append(shot);
				// 	}
				// });
				scene.append(player);
				// ここまでゲーム内容を記述します
			});
			g.game.replaceScene(scene);
		}, 5000);

	});

	g.game.pushScene(titleScene);

	// タイトル
	function createTitleScene(): g.Scene {
		const titleScene = new g.Scene({
			game: g.game
		});
		titleScene.loaded.add(() => {
			// テキスト表示
			const font = new g.DynamicFont({
				game: g.game,
				fontFamily: g.FontFamily.SansSerif,
				size: 20
			});
			const label = new g.Label({
				scene: titleScene,
				font: font,
				text: `Akashic Engine てすと`,
				textColor: "black",
				fontSize: 20
			});
			label.x = (g.game.width - label.width) / 2;
			label.y = (g.game.height - label.height) / 2;
			titleScene.append(label);
		});
		return titleScene;
	}
}
