import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manages player data, balances, and achievements
    Args: event with httpMethod, body, queryStringParameters
          context with request_id attribute
    Returns: HTTP response with player data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            telegram_id = params.get('telegram_id')
            
            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'telegram_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                SELECT id, telegram_id, username, first_name, last_name, 
                       photo_url, coins, rubies, total_wins, total_games, 
                       created_at, last_login
                FROM players 
                WHERE telegram_id = %s
            ''', (telegram_id,))
            
            player = cur.fetchone()
            
            if player:
                cur.execute('''
                    SELECT achievement_name, progress, completed, completed_at
                    FROM achievements
                    WHERE player_id = %s
                ''', (player['id'],))
                
                achievements = cur.fetchall()
                player_data = dict(player)
                player_data['achievements'] = [dict(a) for a in achievements]
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(player_data, default=str),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Player not found'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            telegram_id = body_data.get('telegram_id')
            username = body_data.get('username', '')
            first_name = body_data.get('first_name', '')
            last_name = body_data.get('last_name', '')
            photo_url = body_data.get('photo_url', '')
            
            if not telegram_id or not first_name:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'telegram_id and first_name required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO players (telegram_id, username, first_name, last_name, photo_url)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (telegram_id) 
                DO UPDATE SET 
                    username = EXCLUDED.username,
                    last_login = CURRENT_TIMESTAMP
                RETURNING id, telegram_id, username, first_name, last_name, 
                          photo_url, coins, rubies, total_wins, total_games
            ''', (telegram_id, username, first_name, last_name, photo_url))
            
            player = cur.fetchone()
            
            default_achievements = [
                'Первая победа',
                'Мастер колеса', 
                'Коллекционер',
                'Везунчик'
            ]
            
            for achievement in default_achievements:
                cur.execute('''
                    INSERT INTO achievements (player_id, achievement_name, progress, completed)
                    VALUES (%s, %s, 0, false)
                    ON CONFLICT (player_id, achievement_name) DO NOTHING
                ''', (player['id'], achievement))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(player), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            telegram_id = body_data.get('telegram_id')
            coins = body_data.get('coins')
            rubies = body_data.get('rubies')
            
            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'telegram_id required'}),
                    'isBase64Encoded': False
                }
            
            update_fields = []
            update_values = []
            
            if coins is not None:
                update_fields.append('coins = %s')
                update_values.append(coins)
            
            if rubies is not None:
                update_fields.append('rubies = %s')
                update_values.append(rubies)
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            update_values.append(telegram_id)
            
            cur.execute(f'''
                UPDATE players 
                SET {', '.join(update_fields)}
                WHERE telegram_id = %s
                RETURNING id, telegram_id, coins, rubies
            ''', update_values)
            
            player = cur.fetchone()
            conn.commit()
            
            if player:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(dict(player), default=str),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Player not found'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
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
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
