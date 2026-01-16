from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from rlm.rlm_repl import RLM_REPL
from human_action_utils import human_action_book
import os

app = Flask(__name__, 
            static_folder='frontend',
            template_folder='frontend')
CORS(app)

# Inicializar el contexto una sola vez al arrancar el servidor
context = None
rlm = None

def initialize_rlm():
    """Inicializa el RLM y carga el contexto del libro"""
    global context, rlm
    if context is None:
        print("📚 Cargando el libro 'Human Action'...")
        context = human_action_book()
        print("✅ Libro cargado exitosamente")
    
    if rlm is None:
        print("🤖 Inicializando RLM...")
        rlm = RLM_REPL(
            model="gpt-5",
            recursive_model="gpt-5-nano",
            enable_logging=True,
            max_iterations=10
        )
        print("✅ RLM inicializado")

@app.route('/')
def index():
    """Sirve el archivo index.html"""
    return render_template('index.html')

@app.route('/media/<path:filename>')
def serve_media(filename):
    """Sirve archivos desde la carpeta media"""
    return send_from_directory('media', filename)

@app.route('/api/query', methods=['POST'])
def process_query():
    """Procesa una query y devuelve el resultado"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query vacía'}), 400
        
        # Asegurarse de que RLM está inicializado
        initialize_rlm()
        
        # Procesar la query
        print(f"🔍 Procesando query: {query}")
        result = rlm.completion(context=context, query=query)
        print(f"✅ Query procesada exitosamente")
        
        return jsonify({
            'success': True,
            'result': result,
            'query': query
        })
        
    except Exception as e:
        print(f"❌ Error procesando query: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint para verificar el estado del servidor"""
    return jsonify({
        'status': 'ok',
        'rlm_initialized': rlm is not None,
        'context_loaded': context is not None
    })

if __name__ == '__main__':
    # Inicializar RLM al arrancar
    initialize_rlm()
    
    # Arrancar el servidor
    port = int(os.environ.get('PORT', 5000))
    print(f"\n🚀 Servidor corriendo en http://localhost:{port}")
    print(f"📖 Frontend disponible en http://localhost:{port}\n")
    
    app.run(host='0.0.0.0', port=port, debug=True)
