import { user } from "@prisma/client";
import {AuthResponse} from "../types/Auth.dto.js"
class AuthenticationService {
  async register(email: string,password: string,role:string): Promise<AuthResponse> {
    throw new Error("Inscription Utilisateur");
  }

  async login(email: string,password: string): Promise<AuthResponse> {
    throw new Error("Utilisateur Connexion");
  }

  async logout(): Promise<void> {
    throw new Error("Utilisateur DeConnecter");
  }

  async getUser(): Promise<AuthResponse> {
    throw new Error("Liste des Utilisateurs");
  } 
}