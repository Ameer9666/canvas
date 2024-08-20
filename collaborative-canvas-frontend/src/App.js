import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Circle, Line } from 'fabric';
import useWebSocket from 'react-use-websocket';
import axios from 'axios';

const SOCKET_URL = 'ws://localhost:3001';

const App = () => {
    const [canvas, setCanvas] = useState(null);
    const canvasRef = useRef(null);

    const { sendJsonMessage } = useWebSocket(SOCKET_URL, {
        onMessage: (event) => {
            const shape = JSON.parse(event.data);
            let obj;
            switch (shape.type) {
                case 'rect':
                    obj = new Rect({
                        left: shape.x,
                        top: shape.y,
                        fill: shape.color,
                        width: shape.width,
                        height: shape.height,
                    });
                    break;
                case 'circle':
                    obj = new Circle({
                        left: shape.x,
                        top: shape.y,
                        fill: shape.color,
                        radius: shape.radius,
                    });
                    break;
                case 'line':
                    obj = new Line([shape.x1, shape.y1, shape.x2, shape.y2], {
                        stroke: shape.color,
                    });
                    break;
                default:
                    break;
            }
            if (obj) canvas.add(obj);
        },
    });

    useEffect(() => {
        const canvasObj = new Canvas(canvasRef.current);
        setCanvas(canvasObj);

        axios.get('http://localhost:3001/shapes')
            .then(response => {
                response.data.forEach(shape => {
                    let obj;
                    switch (shape.type) {
                        case 'rect':
                            obj = new Rect({
                                left: shape.x,
                                top: shape.y,
                                fill: shape.color,
                                width: shape.width,
                                height: shape.height,
                            });
                            break;
                        case 'circle':
                            obj = new Circle({
                                left: shape.x,
                                top: shape.y,
                                fill: shape.color,
                                radius: shape.radius,
                            });
                            break;
                        case 'line':
                            obj = new Line([shape.x1, shape.y1, shape.x2, shape.y2], {
                                stroke: shape.color,
                            });
                            break;
                        default:
                            break;
                    }
                    if (obj) canvasObj.add(obj);
                });
            });

        canvasObj.on('object:added', (e) => {
            if (!e.target.id) {
                let shape = {};
                if (e.target.type === 'rect') {
                    shape = {
                        type: 'rect',
                        x: e.target.left,
                        y: e.target.top,
                        width: e.target.width * e.target.scaleX,
                        height: e.target.height * e.target.scaleY,
                        color: e.target.fill,
                    };
                } else if (e.target.type === 'circle') {
                    shape = {
                        type: 'circle',
                        x: e.target.left,
                        y: e.target.top,
                        radius: e.target.radius * e.target.scaleX,
                        color: e.target.fill,
                    };
                } else if (e.target.type === 'line') {
                    shape = {
                        type: 'line',
                        x1: e.target.x1,
                        y1: e.target.y1,
                        x2: e.target.x2,
                        y2: e.target.y2,
                        color: e.target.stroke,
                    };
                }
                sendJsonMessage(shape);
            }
        });

        return () => canvasObj.dispose();
    }, [sendJsonMessage]);

    const addRectangle = () => {
        const rect = new Rect({
            left: 100,
            top: 100,
            fill: 'red',
            width: 100,
            height: 100,
        });
        canvas.add(rect);
    };

    const addCircle = () => {
        const circle = new Circle({
            left: 200,
            top: 200,
            fill: 'blue',
            radius: 50,
        });
        canvas.add(circle);
    };

    const addLine = () => {
        const line = new Line([50, 50, 200, 200], {
            stroke: 'green',
        });
        canvas.add(line);
    };

    return (
        <div>
            <h1>Collaborative Drawing Canvas</h1>
            <button onClick={addRectangle}>Add Rectangle</button>
            <button onClick={addCircle}>Add Circle</button>
            <button onClick={addLine}>Add Line</button>
            <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid #000' }} />
        </div>
    );
};

export default App;
