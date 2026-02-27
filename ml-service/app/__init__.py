from flask import Flask
from flask_cors import CORS
from .config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    from .routes.health import health_bp
    from .routes.extract import extract_bp
    from .routes.skills import skills_bp
    from .routes.analyze import analyze_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(extract_bp, url_prefix='/api')
    app.register_blueprint(skills_bp, url_prefix='/api')
    app.register_blueprint(analyze_bp, url_prefix='/api')

    return app
