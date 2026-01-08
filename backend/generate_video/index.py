import json

def handler(event: dict, context) -> dict:
    '''Генерация видео по текстовому описанию без ограничений'''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        prompt = body.get('prompt', '').strip()
        
        if not prompt:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Prompt is required'}),
                'isBase64Encoded': False
            }
        
        import requests
        import os
        import time
        
        api_key = os.environ.get('FAL_KEY')
        
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'API key not configured'}),
                'isBase64Encoded': False
            }
        
        submit_response = requests.post(
            'https://queue.fal.run/fal-ai/fast-svd/text-to-video',
            headers={
                'Authorization': f'Key {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'prompt': prompt,
                'duration': 3,
                'fps': 24
            },
            timeout=10
        )
        
        if submit_response.status_code != 200:
            return {
                'statusCode': submit_response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Submission failed: {submit_response.text}'}),
                'isBase64Encoded': False
            }
        
        result = submit_response.json()
        request_id = result.get('request_id')
        
        if not request_id:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No request ID returned'}),
                'isBase64Encoded': False
            }
        
        max_wait = 90
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            status_response = requests.get(
                f'https://queue.fal.run/fal-ai/fast-svd/text-to-video/requests/{request_id}',
                headers={
                    'Authorization': f'Key {api_key}'
                },
                timeout=10
            )
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                
                if status_data.get('status') == 'COMPLETED':
                    video_url = status_data.get('video', {}).get('url')
                    
                    if video_url:
                        return {
                            'statusCode': 200,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({'url': video_url}),
                            'isBase64Encoded': False
                        }
                
                elif status_data.get('status') == 'FAILED':
                    return {
                        'statusCode': 500,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Video generation failed'}),
                        'isBase64Encoded': False
                    }
            
            time.sleep(3)
        
        return {
            'statusCode': 408,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Video generation timeout'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
