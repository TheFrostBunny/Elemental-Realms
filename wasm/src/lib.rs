use js_sys::{Array, Object};
use web_sys::console;
use wasm_bindgen::JsValue;
use serde_wasm_bindgen::to_value;
#[wasm_bindgen]
pub fn spawn_enemies(realm: &str, count: u32) -> Array {
    let elements = ["fire", "water", "earth", "air"];
    let arr = Array::new();
    
    // Detailed debugging of received parameters
    console::log_2(&"[RUST] spawn_enemies called with realm:".into(), &JsValue::from_str(realm));
    console::log_2(&"[RUST] spawn_enemies called with count:".into(), &JsValue::from_f64(count as f64));
    console::log_2(&"[RUST] realm.len():".into(), &JsValue::from_f64(realm.len() as f64));
    console::log_2(&"[RUST] realm.is_empty():".into(), &JsValue::from_bool(realm.is_empty()));
    
    // Validate realm
    let valid_realm = match realm {
        "fire" | "water" | "earth" | "air" => realm,
        _ => {
            if realm.is_empty() {
                console::log_1(&"[RUST] Realm is empty string".into());
            } else {
                console::log_2(&"[RUST] Invalid realm received:".into(), &JsValue::from_str(realm));
            }
            console::log_1(&"Invalid realm passed to spawn_enemies, defaulting to 'fire'".into());
            "fire"
        }
    };
    // Validate count
    if count == 0 {
        console::log_1(&"spawn_enemies called with count 0, returning empty array".into());
        return arr;
    }
    console::log_1(&format!("Spawning {} enemies for realm {}", count, valid_realm).into());
    for i in 0..count {
        console::log_1(&format!("Enemy #{}", i).into());
        let angle = js_sys::Math::random() * std::f64::consts::PI * 2.0;
        let dist = 5.0 + js_sys::Math::random() * 12.0;
        let idx = (js_sys::Math::floor(js_sys::Math::random() * elements.len() as f64)) as usize;
        let idx = idx.min(elements.len() - 1);
        let el = elements[idx];
        let enemy = Object::new();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("id"), &JsValue::from_str(&format!("{}-enemy-{}-{}", valid_realm, i, js_sys::Date::now())))
            .unwrap();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("element"), &JsValue::from_str(el)).unwrap();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("position"), &to_value(&vec![angle.cos() * dist, 0.6, angle.sin() * dist]).unwrap()).unwrap();
        let health = 30 + (js_sys::Math::floor(js_sys::Math::random() * 20.0) as i32);
        js_sys::Reflect::set(&enemy, &JsValue::from_str("health"), &JsValue::from_f64(health as f64)).unwrap();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("maxHealth"), &JsValue::from_f64(health as f64)).unwrap();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("speed"), &JsValue::from_f64(1.5 + js_sys::Math::random() * 1.5)).unwrap();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("damage"), &JsValue::from_f64(8.0 + js_sys::Math::floor(js_sys::Math::random() * 7.0))).unwrap();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("xpReward"), &JsValue::from_f64(15.0 + js_sys::Math::floor(js_sys::Math::random() * 15.0))).unwrap();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("dead"), &JsValue::from_bool(false)).unwrap();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("attackCooldown"), &JsValue::from_f64(1200.0)).unwrap();
        js_sys::Reflect::set(&enemy, &JsValue::from_str("lastAttackTime"), &JsValue::from_f64(0.0)).unwrap();
        arr.push(&enemy);
    }
    console::log_1(&format!("Returning array with length: {}", arr.length()).into());
    arr
}

#[wasm_bindgen]
pub fn spawn_collectibles(realm: &str, count: u32) -> Array {
    let types = ["health", "xp", "element_shard"];
    let arr = Array::new();
    // Validate realm
    let valid_realm = match realm {
        "fire" | "water" | "earth" | "air" => realm,
        _ => {
            console::log_1(&"Invalid realm passed to spawn_collectibles, defaulting to 'fire'".into());
            "fire"
        }
    };
    // Validate count
    if count == 0 {
        console::log_1(&"spawn_collectibles called with count 0, returning empty array".into());
        return arr;
    }
    for i in 0..count {
        let angle = js_sys::Math::random() * std::f64::consts::PI * 2.0;
        let dist = 3.0 + js_sys::Math::random() * 14.0;
        let item = Object::new();
        js_sys::Reflect::set(&item, &JsValue::from_str("id"), &JsValue::from_str(&format!("{}-collect-{}-{}", valid_realm, i, js_sys::Date::now())))
            .unwrap();
        let idx = (js_sys::Math::floor(js_sys::Math::random() * types.len() as f64)) as usize;
        let idx = idx.min(types.len() - 1);
        js_sys::Reflect::set(&item, &JsValue::from_str("type"), &JsValue::from_str(types[idx])).unwrap();
        js_sys::Reflect::set(&item, &JsValue::from_str("element"), &JsValue::from_str(valid_realm)).unwrap();
        js_sys::Reflect::set(&item, &JsValue::from_str("position"), &to_value(&vec![angle.cos() * dist, 0.8 + (i as f64).sin() * 0.3, angle.sin() * dist]).unwrap()).unwrap();
        js_sys::Reflect::set(&item, &JsValue::from_str("collected"), &JsValue::from_bool(false)).unwrap();
        arr.push(&item);
    }
    arr
}
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
