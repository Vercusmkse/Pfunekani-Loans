fn main() {
    // Load the .env file
    dotenvy::dotenv().expect("Failed to load .env file");
    // Re-run the build script if .env changes
    println!("cargo:rerun-if-changed=.env");
}