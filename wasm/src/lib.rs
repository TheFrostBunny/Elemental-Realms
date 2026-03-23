use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calc_xp_to_next(level: u32) -> u32 {
    (80.0 * 1.4_f64.powi((level as i32) - 1)).floor() as u32
}

#[wasm_bindgen]
pub fn calc_damage(attack_power: u32, attacker_element: &str, defender_element: &str) -> u32 {
    let (strength, weakness) = match attacker_element {
        "fire" => ("earth", "water"),
        "water" => ("fire", "earth"),
        "earth" => ("water", "air"),
        "air" => ("earth", "fire"),
        _ => ("", ""),
    };
    let mut multiplier = 1.0;
    if strength == defender_element {
        multiplier = 2.0;
    }
    if weakness == defender_element {
        multiplier = 0.5;
    }
    (attack_power as f64 * multiplier).floor() as u32
}
