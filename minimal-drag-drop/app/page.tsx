'use client';

import {Player} from '@revideo/player-react';
import {useState, useEffect, useRef} from 'react';
import {LoaderCircle} from 'lucide-react';
import { parseStream } from '../utils/parse';
import {Player as CorePlayer} from '@revideo/core';
import {Scene2D, Shape} from '@revideo/2d';
import project from '@/revideo/project';


function Button({
	children,
	loading,
	onClick,
}: {
	children: React.ReactNode;
	loading: boolean;
	onClick: () => void;
}) {
	return (
		<button
			className="text-sm flex items-center gap-x-2 rounded-md p-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
			onClick={() => onClick()}
			disabled={loading}
		>
			{loading && <LoaderCircle className="animate-spin h-4 w-4 text-gray-700" />}
			{children}
		</button>
	);
}

export default function Home() {
	const [nodes, setNodes] = useState<Map<string, any>>(new Map([
		['txt', { text: "Text 1", x: 0, y: 0 }]
	  ]));
	const [draggingNode, setDraggingNode] = useState<Shape | null>(null);
	const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);
	const [playerRect, setPlayerRect] = useState<DOMRect | null>(null);
	const [corePlayer, setCorePlayer] = useState<CorePlayer | null>(null);
	const [transformMatrix, setTransformMatrix] = useState<DOMMatrix | null>(null);

	const [renderLoading, setRenderLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

	const [playing, setPlaying] = useState<boolean>(false);
	const [dimensions, setDimensions] = useState<{x: number, y: number}>({ x: 1920, y: 1080 });
	const [selectedNode, setSelectedNode] = useState<{
		key: string;
		x: number;
		y: number;
		width: number;
		height: number;
	  } | null>(null);
	
	  const playerContainerRef = useRef<HTMLDivElement>(null);
	
	useEffect(() => {
		console.log("changing", "playerrect", "dimensions", playerRect, dimensions);
	  if (playerRect) {
		setTransformMatrix(createTransformationMatrix(playerRect, dimensions));
	  }
	}, [playerRect, dimensions]);
  
	const handlePlayerReady = (player: CorePlayer) => {
		setCorePlayer(player);
	};

	const addTextNode = () => {
		setNodes(prevNodes => {
		  const newNodes = new Map(prevNodes);
		  const newKey = `txt_${newNodes.size+1}`;
		  newNodes.set(newKey, { text: `Text ${newNodes.size+1}`, x: 0, y: 0 });
		  return newNodes;
		});
	  };

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		console.log("hiiii")
		console.log("playerrect", playerRect);
		console.log("transformmatrix", transformMatrix);
		if (playerRect && transformMatrix) {
			const { x: playerX, y: playerY } = transformPoint(
			event.clientX,
			event.clientY,
			transformMatrix
			);

			console.log("AHHH")

			console.log("pos", playerX, playerY);

			let hitNode = (corePlayer?.playback.currentScene as Scene2D).getNodeByPosition(playerX, playerY) as Shape;
			while (hitNode) {
				console.log("joo");
				// We want to avoid getting TxtLeaf nodes, but only their parent Txt nodes
				if (nodes.has(hitNode.key)) {
					console.log("jaaa", hitNode.key);
					setDraggingNode(hitNode);
					const node = nodes.get(hitNode.key);
					setDragOffset({ x: playerX - node.x, y: playerY - node.y });

					const position = hitNode.position();
					const { x, y } = transformPoint(position.x+dimensions.x/2, position.y+dimensions.y/2, transformMatrix.inverse());

					setSelectedNode({
					key: hitNode.key,
					x: x,
					y: y,
					width: selectedNode?.width || hitNode.width() / transformMatrix.a,
					height: selectedNode?.height || hitNode.height() / transformMatrix.d
					});
					return;
				}
			hitNode = hitNode.parent() as Shape;
			}
			setSelectedNode(null);
		};
	}

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (draggingNode && playerRect && transformMatrix) {
			const { x: playerX, y: playerY } = transformPoint(
				event.clientX,
				event.clientY,
				transformMatrix
			);
		
			setNodes(prevNodes => {
				const newNodes = new Map(prevNodes);
				const node = newNodes.get(draggingNode.key);
				if (node && dragOffset) {
					node.x = playerX - dragOffset.x;
					node.y = playerY - dragOffset.y;

					const { x, y } = transformPoint(node.x+dimensions.x/2, node.y+dimensions.y/2, transformMatrix.inverse());
					setSelectedNode({
					key: draggingNode.key,
					x: x,
					y: y,
					width: selectedNode?.width || draggingNode.width() / transformMatrix.a,
					height: selectedNode?.height || draggingNode.height() / transformMatrix.d,
					});

				}
				return newNodes;
			});
		}
	};  
	  
	function createTransformationMatrix(
		playerRect: DOMRect,
		dimensions: { x: number; y: number }
	  ): DOMMatrix {
		const scaleX = dimensions.x / playerRect.width;
		const scaleY = dimensions.y / playerRect.height;
	  
		const matrix = new DOMMatrix();
		matrix.scaleSelf(scaleX, scaleY);
		matrix.translateSelf(-playerRect.left, -playerRect.top);

		return matrix;
	  }
	  
	function transformPoint(
		x: number,
		y: number,
		matrix: DOMMatrix
	  ): { x: number; y: number } {
		const point = new DOMPoint(x, y);
		const transformedPoint = point.matrixTransform(matrix);
		return { x: transformedPoint.x, y: transformedPoint.y };
	  }

	/**
	 * Render the video.
	 */
	async function render() {
		setRenderLoading(true);
		const res = await fetch('/api/render', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				variables: {
					nodes: Object.fromEntries(nodes)
				},
				streamProgress: true,
			}),
		}).catch((e) => console.log(e));

		if (!res) {
			alert('Failed to render video.');
			return;
		}

		const downloadUrl = await parseStream(res.body!.getReader(), (p) => setProgress(p));
		setRenderLoading(false);
		setDownloadUrl(downloadUrl);
	}

	return (
		<>
		  <div className="m-auto p-12 max-w-6xl flex flex-col gap-y-4">
			<div 
			  className="rounded-lg overflow-hidden w-[100%] py-20 bg-gray-100 flex items-center justify-center"
			  onPointerDown={handlePointerDown}
			  onPointerMove={handlePointerMove}
			  onPointerUp={() => {
				setDraggingNode(null);
				setDragOffset(null);
			  }}
			>
			  <div className='w-[80%] h-[80%]' ref={playerContainerRef}>
				<Player
				  project={project}
				  controls={false}
				  playing={playing}
				  width={dimensions.x}
				  height={dimensions.y}
				  variables={{
					nodes: Object.fromEntries(nodes),
				  }}
				  onPlayerReady={handlePlayerReady}
				  onPlayerResize={(rect: DOMRect) => {
					setPlayerRect(rect);
				  }}
				/>
				{(selectedNode && playerRect) && (
				  <div
					className="absolute border-2 border-[#5bbad5] pointer-events-none"
					style={{
					  left: `${selectedNode.x-selectedNode.width/2}px`,
					  top: `${selectedNode.y-selectedNode.height/2}px`,
					  width: `${selectedNode.width}px`,
					  height: `${selectedNode.height}px`,
					}}
				  />
				)}
			  </div>
			</div>
				<div className="flex gap-x-4">
					{/* Progress bar */}
					<div className="text-sm flex-1 bg-gray-100 rounded-md overflow-hidden">
						<div
							className="text-gray-600 bg-gray-400 h-full flex items-center px-4 transition-all transition-200"
							style={{
								width: `${Math.round(progress * 100)}%`,
							}}
						>
							{Math.round(progress * 100)}%
						</div>
					</div>
					{downloadUrl ? (
						<a
							href={downloadUrl}
							download
							className="text-sm flex items-center gap-x-2 rounded-md p-2 bg-green-200 text-gray-700 hover:bg-gray-300"
						>
							Download video
						</a>
					) : (
						<>
						<Button
								loading={false}
								onClick={() => {
									setPlaying(!playing);
									setSelectedNode(null);
								}}
							>
								{playing ? "Pause" : "Play"}
						</Button>

						<Button onClick={addTextNode} loading={false}>
							Add Text
						</Button>

						<Button onClick={() => render()} loading={renderLoading}>
							Render video
						</Button>
						</>
					)}
				</div>
			</div>
		</>
	);
}